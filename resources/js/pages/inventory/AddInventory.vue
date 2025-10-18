<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useForm } from "@inertiajs/vue3"
import axios from "axios"
import { useInventory } from "@/stores/inventory"
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

const inventoryStore = useInventory()
defineEmits(["saved"])

type ItemRow = {
  product_id?: string | number
  quantity: number
  price: number
  subtotal: number
}

// Dialog State
const localOpen = ref(inventoryStore.modalType === 'add')

// Product State
const productOptions = ref<any[]>([])
const loadingProducts = ref(false)

// Customer Search State - Local filtering
const customerSearchQuery = ref("")
const filteredCustomerOptions = ref<any[]>([])

// Use computed property to get customers from the store
const customerOptions = computed(() => inventoryStore.customerOptions)

// --- FORM STATE ---
const form = useForm({
  customer: "" as string,
  customer_type: "retail",
  store_id: inventoryStore.defaultStoreId,
  payment_method: "cash",
  items: [] as ItemRow[],
  discount: 0,
  tax: 0,
  note: "",
})

// init one row
if (!form.items.length) {
  form.items.push({ product_id: "", quantity: 1, price: 0, subtotal: 0 })
}

// ========== CUSTOMER SEARCH (LOCAL FILTERING) ==========
const handleCustomerSearch = (query: string) => {
  customerSearchQuery.value = query
  const trimmedQuery = query.trim().toLowerCase()
  
  if (!trimmedQuery || trimmedQuery.length < 1) {
    // Return all customers when no query
    const allCustomers = customerOptions.value
    filteredCustomerOptions.value = allCustomers
    return allCustomers
  }

  // Filter customers locally from the store data
  const filtered = customerOptions.value.filter(customer => 
    customer.label.toLowerCase().includes(trimmedQuery)
  )
  
  filteredCustomerOptions.value = filtered
  return filtered
}

// ========== PRODUCT SEARCH (LOCAL FILTERING) ==========
const handleProductSearch = (query: string, currentRowProductId?: string | number) => {
  const trimmedQuery = query.trim().toLowerCase()
  
  if (!trimmedQuery || trimmedQuery.length < 1) {
    return getAvailableProductOptions(form.items.map(r => r.product_id).filter(id => id && id !== currentRowProductId))
  }

  // Filter products locally from the loaded product options
  const filtered = productOptions.value.filter(product => {
    const matchesSearch = product.label.toLowerCase().includes(trimmedQuery) ||
      product.categories?.some((c: string) => c?.toLowerCase().includes(trimmedQuery)) ||
      product.brand?.toLowerCase().includes(trimmedQuery)
    
    // Exclude already selected products in other rows (except current row)
    const isAvailable = !form.items.some(item => 
      item.product_id && item.product_id !== currentRowProductId && item.product_id === product.value
    )
    
    return matchesSearch && isAvailable
  })
  
  return filtered
}

// ========== PRODUCT HELPERS ==========
const fetchProductOptions = async (storeId?: string) => {
  if (!storeId) { 
    productOptions.value = []
    return 
  }
  
  loadingProducts.value = true
  try {
    const params: any = { per_page: 1000 }
    if (storeId) params.store_id = storeId
    const { data } = await axios.get(route("products.index"), { params })
    productOptions.value = (data.products.data || []).map((p: any) => ({
      value: p.id,
      label: p.name,
      categories: p.categories?.map((c: any) => c.name) ?? [],
      brand: p.brand,
      retail_price: Number(p.retail_price) || 0,
      wholesale_price: Number(p.wholesale_price) || 0,
      store_id: p.store?.id ?? null,
      store_name: p.store?.name ?? null
    }))
  } catch (error) {
    console.error("Error fetching product options:", error)
    productOptions.value = []
  } finally {
    loadingProducts.value = false
  }
}

const getAvailableProductOptions = (selectedIds: (string | number)[]) => {
  return productOptions.value.filter(opt => 
    !selectedIds.map(String).includes(String(opt.value))
  )
}

const getProductById = (id: string | number) =>
  productOptions.value.find(p => p.value === id)

const calculateProductPrice = (productId: string | number, type: string) => {
  const p = getProductById(productId)
  if (!p) return 0
  return Number(type === "wholesale" ? p.wholesale_price : p.retail_price) || 0
}

const addRow = () => form.items.push({ product_id: "", quantity: 1, price: 0, subtotal: 0 })

const removeRow = (i: number) => {
  form.items.splice(i, 1)
}

const setProductForRow = (row: ItemRow, id?: string | number) => {
  const pid = id ?? row.product_id
  if (!pid) return
  
  const price = calculateProductPrice(pid, form.customer_type)
  row.price = price
  row.quantity = Math.max(1, Number(row.quantity) || 1)
  row.subtotal = row.price * row.quantity
  const prod = getProductById(pid)
  if (!form.store_id && prod?.store_id) form.store_id = String(prod.store_id)
}

const setQty = (row: ItemRow, qty: number) => {
  row.quantity = Math.max(1, Number(qty) || 1)
  row.subtotal = row.price * row.quantity
}

const toggleCustomerType = () => {
  form.customer_type = form.customer_type === "retail" ? "wholesale" : "retail"
  form.items.forEach(row => setProductForRow(row))
}

const total = computed(() => form.items.reduce((s, r) => s + (Number(r.subtotal) || 0), 0))
const grandTotal = computed(() => total.value - Number(form.discount) + Number(form.tax))

// ========== WATCHERS ==========
watch(() => form.store_id, async (v) => { 
  if (v) await fetchProductOptions(v) 
})

watch(() => form.customer_type, () => form.items.forEach(r => setProductForRow(r)))

watch(() => inventoryStore.modalType, (t) => {
  if (t === "add") localOpen.value = true
  else if (t === null) localOpen.value = false
}, { immediate: true })

watch(localOpen, (v) => {
  if (!v && inventoryStore.modalType === "add") inventoryStore.closeModal()
})

onMounted(async () => {
  // Ensure customer options are loaded
  if (!inventoryStore.optionsInitialized) {
    await inventoryStore.initializeOptions()
  }
  if (form.store_id) await fetchProductOptions(form.store_id)
})

// ========== SUBMIT ==========
const submit = async (e: Event) => {
  e.preventDefault()
  if (!form.store_id) return alert("Please select a store")
  if (!form.items.some(i => i.product_id)) return alert("Please add at least one product")

  const finalCustomerValue = String(form.customer).trim()
  const existingCustomer = customerOptions.value.find(
    c => String(c.value) === finalCustomerValue
  )

  let payload: Record<string, any> = { ...form.data() }
  delete payload.customer
  payload.subtotal = total.value
  payload.total = grandTotal.value

  if (existingCustomer) {
    payload.customer_id = existingCustomer.value
  } else if (finalCustomerValue) {
    payload.customer_name = finalCustomerValue
  }

  console.log("✅ Final Payload:", payload)

  form.post(route("inventories.store"), {
    data: payload,
    preserveScroll: true,
    onSuccess: async (page) => {
      const inventory = page.props?.inventory
      const servedBy = page.props.auth?.user?.name
      const finalName = existingCustomer?.label || finalCustomerValue || "Walk-in Customer"
      if (inventory) {
        localOpen.value = false
        inventoryStore.closeModal()
        await new Promise(r => setTimeout(r, 100))
        await inventoryStore.generateInvoice(inventory, servedBy, finalName)
      }
    },
    onError: (err) => console.error("❌ Form errors:", err),
    onFinish: () => {
      const s = form.store_id, t = form.customer_type
      form.reset()
      form.store_id = s
      form.customer_type = t
      form.items = [{ product_id: "", quantity: 1, price: 0, subtotal: 0 }]
      form.customer = ""
      filteredCustomerOptions.value = []
      customerSearchQuery.value = ""
      if (s) fetchProductOptions(s)
    }
  })
}
</script>

<template>
  <Dialog
    :open="localOpen"
    @update:open="(val) => localOpen = val"
  >
    <DialogContent
      class="!max-w-none w-[98vw] xl:w-[90vw] h-[98vh] p-0 flex flex-col overflow-hidden"
    >
      <form class="flex flex-col h-full" @submit="submit">
        <div class="px-6 py-4 border-b bg-white shrink-0 sticky top-0 z-20">
          <div class="flex items-center justify-between">
            <div>
              <DialogHeader class="p-0 m-0">
                <DialogTitle class="text-lg font-semibold">New Transaction</DialogTitle>
                <DialogDescription class="sr-only">
                  Create a transaction with customer details and products
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
                  :options="filteredCustomerOptions"
                  placeholder="Search or enter new customer name"
                  :creatable="true"
                  :filter="handleCustomerSearch"
                  :loading="false"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Select existing customer or type new name (optional)
                </p>
              </div>

              <div v-if="!inventoryStore.hasSingleStore">
                <Label for="store" class="text-xs">Store</Label>
                <Select
                  id="store"
                  v-model="form.store_id"
                  :options="inventoryStore.storeOptions"
                  placeholder="Select store"
                  :disabled="inventoryStore.storeOptions.length === 0"
                />
                <p v-if="inventoryStore.storeOptions.length === 0" class="text-xs text-red-500 mt-1">
                  No stores available
                </p>
              </div>
              <div v-else>
                <Label for="store" class="text-xs">Store</Label>
                <Input
                  id="store"
                  :value="inventoryStore.storeOptions.find(s => s.value === form.store_id)?.label || 'Loading...'"
                  disabled
                  class="h-9 bg-gray-100"
                />
              </div>
              <div>
                <Label for="payment" class="text-xs">Payment Method</Label>
                <Select id="payment" v-model="form.payment_method" :options="inventoryStore.paymentMethods" />
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
            <div v-else-if="loadingProducts" class="text-center py-8 text-gray-500">
              <p>Loading products...</p>
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
                    :options="productOptions"  
                    placeholder="Search product"
                    :filter="(query) => handleProductSearch(query, row.product_id)"
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
                  <Input :id="`price-${idx}`" :value="(Number(row.price) || 0).toFixed(2)" disabled class="h-9" />
                </div>

                <div class="col-span-2">
                  <Label :for="`subtotal-${idx}`" class="sr-only">Subtotal</Label>
                  <Input :id="`subtotal-${idx}`" :value="(Number(row.subtotal) || 0).toFixed(2)" disabled class="h-9 font-semibold" />
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
            <div class="grid grid-cols-1 gap-4">
              
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
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 3px; }
::-webkit-scrollbar-thumb { background: #cbd5e0; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #a0aec0; }
</style>