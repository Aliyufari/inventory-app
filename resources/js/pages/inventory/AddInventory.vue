<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useForm, usePage } from "@inertiajs/vue3"
import axios from "axios"
import { useInventory } from "@/stores/inventory"
import { useInvoice } from "@/stores/invoices"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Textarea from "@/components/ui/textarea/Textarea.vue"
import SearchableSelect from "@/components/ui/select/SearchableSelect.vue"
import Select from "@/components/ui/select/Select.vue"

const page = usePage()
const inventoryStore = useInventory()
const invoiceStore = useInvoice()

defineEmits(["saved"])

type ItemRow = {
  product_id?: string | number
  quantity: number
  price: number
  subtotal: number
  store_id?: string
}

const productOptions = ref<any[]>([])
const customerOptions = ref<{ label: string; value: string }[]>([])
const storeOptions = ref<{ label: string; value: string }[]>([])
const hasSingleStore = ref(false)

const form = useForm({
  customer: "" as string,
  customer_type: "retail",
  store_id: "",
  payment_method: "cash",
  items: [] as ItemRow[],
  discount: 0,
  tax: 0,
  note: "",
})

if (!form.items.length) {
  form.items.push({ product_id: "", quantity: 1, price: 0, subtotal: 0 })
}

const paymentMethods = [
  { label: "Cash", value: "cash" },
  { label: "POS", value: "pos" },
  { label: "Transfer", value: "transfer" },
]

// --- Data Fetching and Initialization ---

const fetchProducts = async (storeId?: string) => {
  form.items = [{ product_id: "", quantity: 1, price: 0, subtotal: 0 }]
  productOptions.value = []

  try {
    if (!storeId) return

    const res = await axios.get(route("products.api"), { params: { store_id: storeId } })
    productOptions.value = (res?.data?.products ?? []).map((p: any) => ({
      value: p.id,
      label: p.name,
      categories: p.categories?.map((c: any) => c.name) ?? [],
      brand: p.brand,
      retail_price: p.retail_price,
      wholesale_price: p.wholesale_price,
      store_id: p.store?.id ?? null,
      store_name: p.store?.name ?? null,
    }))
  } catch (err) {
    console.error("Product fetch error", err)
  }
}

const initializeOptions = async () => {
  try {
    const user = page.props.auth?.user

    const [customerRes, storeRes] = await Promise.all([
      axios.get(route("customers.api")),
      axios.get(route("stores.api")),
    ])

    customerOptions.value = (customerRes.data?.customers ?? []).map((c: any) => ({
      label: c.name,
      // Ensure the ID is explicitly a string (UUID)
      value: String(c.id), 
    }))

    let stores = storeRes.data?.stores || storeRes.data || []
    if (!Array.isArray(stores)) stores = []

    storeOptions.value = stores.map((s: any) => ({
      label: s.name,
      value: String(s.id),
    }))

    // Initialize Store
    if (user?.stores?.length === 1) {
      hasSingleStore.value = true
      form.store_id = String(user.stores[0].id)
    } else if (storeOptions.value.length > 0 && !form.store_id) {
      hasSingleStore.value = false
      form.store_id = storeOptions.value[0].value
    }

    if (form.store_id) await fetchProducts(form.store_id)
  } catch (err) {
    console.error("Options loading error", err)
  }
}

onMounted(initializeOptions)

// --- Watchers and Utility Functions ---

watch(() => form.store_id, async (newStoreId) => {
  if (newStoreId) await fetchProducts(newStoreId)
})

watch(() => form.customer_type, () => form.items.forEach((row) => setProductForRow(row)))

const addRow = () => form.items.push({ product_id: "", quantity: 1, price: 0, subtotal: 0 })
const removeRow = (i: number) => form.items.splice(i, 1)

const availableOptions = (row: ItemRow) => {
  const selectedIds = form.items.map((r) => r.product_id).filter((id) => id && id !== row.product_id)
  // Ensure comparison is type-safe by converting to string
  return productOptions.value.filter((opt) => !selectedIds.map(String).includes(String(opt.value)))
}

const setProductForRow = (row: ItemRow, productId?: string | number) => {
  const id = productId ?? row.product_id
  const prod = productOptions.value.find((p: any) => String(p.value) === String(id))
  if (!prod) {
    row.price = row.subtotal = 0
    return
  }
  row.price = form.customer_type === "wholesale" ? prod.wholesale_price : prod.retail_price
  row.quantity = Math.max(1, Number(row.quantity) || 1)
  row.subtotal = row.price * row.quantity
  if (!form.store_id && prod.store_id) form.store_id = String(prod.store_id)
}

const setQty = (row: ItemRow, qty: number) => {
  row.quantity = Math.max(1, Number(qty) || 1)
  row.subtotal = row.price * row.quantity
}

const toggleCustomerType = () => {
  form.customer_type = form.customer_type === "retail" ? "wholesale" : "retail"
  form.items.forEach((row) => setProductForRow(row))
}

const total = computed(() => form.items.reduce((s, r) => s + (Number(r.subtotal) || 0), 0))
const grandTotal = computed(() => total.value - Number(form.discount || 0) + Number(form.tax || 0))

const customFilter = (option: any, label: string, search: string) => {
  const term = search.toLowerCase()
  return (
    label.toLowerCase().includes(term) ||
    option.categories?.some((c: string) => c?.toLowerCase().includes(term))
  )
}

// --- Submission ---
const submit = async (e: Event) => {
  e.preventDefault()
  if (!form.store_id) return alert("Please select a store")
  // Check if at least one item has a product selected
  if (form.items.length === 0 || form.items.every((i) => !i.product_id))
    return alert("Please add at least one product")

  // The final payload needs only 'customer' field with the value from the form
  const payload = {
    ...form.data(),
    subtotal: total.value, 
    total: grandTotal.value, 
  }

  console.log("Customer input:", form.customer)
  console.log("📤 Submitting Payload:", payload)

  form.post(route("inventories.store"), {
    data: payload,
    preserveScroll: true,
    onSuccess: async (page) => {
      const inventory = page.props?.inventory
      const servedBy = page.props.auth?.user?.name

      if (inventory) {
        let customerName = "Walk-in Customer"
        const customerValue = form.customer // Get the submitted value (ID or Name)

        if (customerValue) {
          // Check if the value is an existing customer ID (and retrieve the label/name)
          const existingCustomer = customerOptions.value.find((c) => c.value === customerValue)
          
          if (existingCustomer) {
            customerName = existingCustomer.value // Use existing customer's name
          } else {
            customerName = customerValue // Use the typed-in name string
          }
        }
        
        inventoryStore.closeModal()
        await new Promise((r) => setTimeout(r, 100))
        await invoiceStore.generateInvoice(inventory, servedBy, customerName)
      }
    },
    onError: (errors) => {
      console.error("❌ Form errors:", errors)
      if (errors.store_id) alert("Store selection error: " + errors.store_id)
      if (errors.customer) alert("Customer error: " + errors.customer) 
    },
    onFinish: () => {
      const currentStore = form.store_id
      const currentType = form.customer_type
      form.reset()
      form.store_id = currentStore
      form.customer_type = currentType
      form.items = [{ product_id: "", quantity: 1, price: 0, subtotal: 0 }]
      // Explicitly ensure customer field is an empty string for the Select component
      form.customer = "" 
      if (currentStore) fetchProducts(currentStore)
    },
  })
}
</script>

<template>
  <Dialog
    :open="inventoryStore.modalType === 'add'"
    @update:open="(val) => !val && inventoryStore.closeModal()"
  >
    <DialogContent
      class="!max-w-none w-[98vw] xl:w-[90vw] h-[95vh] p-0 flex flex-col overflow-hidden"
      aria-describedby="add-inventory-description"
    >
      <form class="flex flex-col h-full" @submit="submit">
        <div class="px-6 py-4 border-b bg-white shrink-0 sticky top-0 z-20">
          <div class="flex items-center justify-between">
            <div>
              <DialogHeader class="p-0 m-0">
                <DialogTitle class="text-lg font-semibold">New Transaction</DialogTitle>
                <DialogDescription id="add-inventory-description" class="sr-only">
                  Create a new sales transaction with customer details and products
                </DialogDescription>
              </DialogHeader>
              <p class="text-sm text-gray-500 mt-1">Create a new transaction</p>
            </div>

            <div
              @click="toggleCustomerType"
              @keydown.enter="toggleCustomerType"
              @keydown.space.prevent="toggleCustomerType"
              role="button"
              tabindex="0"
              aria-label="Toggle between Retail and Wholesale pricing"
              class="relative w-30 h-9 flex items-center cursor-pointer rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :class="form.customer_type === 'retail' ? 'bg-green-500' : 'bg-blue-500'"
            >
              <div
                class="absolute w-9 h-9 bg-white rounded-full shadow transform transition-transform duration-300"
                :class="form.customer_type === 'retail' ? 'translate-x-0.5' : 'translate-x-[5.1rem]'"
              ></div>
              <div class="w-full px-3 text-white font-semibold text-xs flex justify-between gap-2 z-10">
                <span>Retail</span>
                <span>Wholesale</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 px-6 py-4 space-y-4 bg-gray-50 overflow-y-auto">
          <section class="bg-white shadow-sm rounded-lg p-4 shrink-0">
            <h3 class="text-sm font-semibold text-gray-700 mb-3">Customer Details</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label for="customer" class="text-xs">Customer</Label>
                <SearchableSelect
                  id="customer"
                  v-model="form.customer"
                  :options="customerOptions"
                  placeholder="Select customer or type new name"
                  :creatable="true"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Select existing customer or type new name (optional)
                </p>
              </div>

              <div v-if="!hasSingleStore">
                <Label for="store" class="text-xs">Store</Label>
                <Select
                  id="store"
                  v-model="form.store_id"
                  :options="storeOptions"
                  placeholder="Select store"
                  :disabled="storeOptions.length === 0"
                />
                <p v-if="storeOptions.length === 0" class="text-xs text-red-500 mt-1">
                  No stores available
                </p>
              </div>
              <div v-else>
                <Label for="store" class="text-xs">Store</Label>
                <Input
                  id="store"
                  :value="storeOptions.find(s => s.value === form.store_id)?.label || 'Loading...'"
                  disabled
                  class="h-9 bg-gray-100"
                />
              </div>
              <div>
                <Label for="payment" class="text-xs">Payment Method</Label>
                <Select id="payment" v-model="form.payment_method" :options="paymentMethods" />
              </div>
            </div>
          </section>

          <section class="bg-white shadow-sm rounded-lg p-4 shrink-0">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-700">Products</h3>
              <Button
                type="button"
                class="h-8 text-xs"
                @click="addRow"
                :disabled="!form.store_id || productOptions.length === 0"
              >
                + Add Item
              </Button>
            </div>

            <div v-if="!form.store_id" class="text-center py-8 text-gray-500">
              <p>Please select a store to view products</p>
            </div>
            <div v-else-if="productOptions.length === 0" class="text-center py-8 text-gray-500">
              <p>No products available for this store</p>
            </div>

            <div v-else class="space-y-3">
              <div class="grid grid-cols-12 gap-2 items-end text-xs font-medium text-gray-500 pb-2 border-b">
                <div class="col-span-5">Item</div>
                <div class="col-span-2">Qty</div>
                <div class="col-span-2">Price</div>
                <div class="col-span-2">Subtotal</div>
                <div class="col-span-1"></div>
              </div>
              <div
                v-for="(row, idx) in form.items"
                :key="idx"
                class="grid grid-cols-12 gap-2 items-end pb-3 border-b last:border-b-0"
              >
                <div class="col-span-5">
                  <Label :for="`product-${idx}`" class="sr-only">Item</Label>
                  <SearchableSelect
                    :id="`product-${idx}`"
                    v-model="row.product_id"
                    :options="availableOptions(row)"
                    placeholder="Search product"
                    :filter="customFilter"
                    @update:modelValue="(val) => setProductForRow(row, val)"
                  />
                </div>

                <div class="col-span-2">
                  <Label :for="`qty-${idx}`" class="sr-only">Quantity</Label>
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                      @click="setQty(row, row.quantity - 1)"
                      aria-label="Decrease quantity"
                      :disabled="row.quantity <= 1"
                    >−</button>
                    <Input
                      :id="`qty-${idx}`"
                      type="number"
                      v-model.number="row.quantity"
                      @input="() => setQty(row, row.quantity)"
                      class="w-16 h-9 text-center"
                      min="1"
                    />
                    <button
                      type="button"
                      class="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                      @click="setQty(row, row.quantity + 1)"
                      aria-label="Increase quantity"
                    >+</button>
                  </div>
                </div>

                <div class="col-span-2">
                  <Label :for="`price-${idx}`" class="sr-only">Price</Label>
                  <Input :id="`price-${idx}`" :value="row.price.toFixed(2)" disabled class="h-9" />
                </div>

                <div class="col-span-2">
                  <Label :for="`subtotal-${idx}`" class="sr-only">Subtotal</Label>
                  <Input :id="`subtotal-${idx}`" :value="row.subtotal.toFixed(2)" disabled class="h-9 font-semibold" />
                </div>

                <div class="col-span-1 flex items-end justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    @click="removeRow(idx)"
                    v-if="form.items.length > 1"
                    class="h-9 w-8 p-0"
                    aria-label="Remove item"
                  >×</Button>
                </div>
              </div>
            </div>
          </section>

          <section class="bg-white shadow-sm rounded-lg p-4 shrink-0">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label class="text-xs mb-2">Additional Note</Label>
                <Textarea
                  v-model="form.note"
                  placeholder="Optional note"
                  class="min-h-[100px] text-sm w-full"
                />
              </div>

              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="space-y-2.5">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-semibold">₦{{ total.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <Label for="discount" class="text-sm text-gray-600">Discount</Label>
                    <Input
                      id="discount"
                      type="number"
                      v-model.number="form.discount"
                      class="w-28 h-9"
                      placeholder="0.00"
                    />
                  </div>
                  <div class="flex justify-between items-center">
                    <Label for="tax" class="text-sm text-gray-600">Tax</Label>
                    <Input
                      id="tax"
                      type="number"
                      v-model.number="form.tax"
                      class="w-28 h-9"
                      placeholder="0.00"
                    />
                  </div>
                  <div
                    class="flex justify-between font-bold text-lg pt-2 border-t-2 border-gray-300"
                  >
                    <span>Grand Total</span>
                    <span class="text-green-600">₦{{ grandTotal.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div class="border-t bg-white px-6 py-4 shrink-0 sticky bottom-0 z-20">
          <div class="flex justify-end items-center gap-3">
            <Button type="button" variant="outline" @click="inventoryStore.closeModal">Cancel</Button>
            <Button
              type="submit"
              :disabled="form.processing || !form.store_id || form.items.every(item => !item.product_id)"
              class="min-w-[150px]"
            >
              {{ form.processing ? 'Saving...' : 'Save Transaction' }}
            </Button>
          </div>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
/* Scrollbar styles for modal */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}
</style>