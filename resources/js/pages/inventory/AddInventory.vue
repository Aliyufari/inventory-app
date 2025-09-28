<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useForm } from "@inertiajs/vue3"
import axios from "axios"
import { useInventory } from "@/stores/inventory"
import { useInvoice } from "@/stores/invoces"

// Components
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Textarea from "@/components/ui/textarea/Textarea.vue"
import SearchableSelect from "@/components/ui/select/SearchableSelect.vue"

const inventoryStore = useInventory()
const invoiceStore = useInvoice()

// product + customer options
const productOptions = ref<{ label: string; value: string; price: number }[]>([])
const customerOptions = ref<{ label: string; value: string }[]>([])

// form
const form = useForm({
  customer: "",   // ✅ use id not name
  payment_method: "cash",
  items: [] as { product_id?: string; quantity: number; price: number; subtotal: number }[],
  discount: 0,
  tax: 0,
  note: "",
  subtotal: 0,
  total: 0,
})

// ensure at least one row
if (!form.items.length) {
  form.items.push({ product_id: "", quantity: 1, price: 0, subtotal: 0 })
}

onMounted(async () => {
  try {
    const [pRes, cRes] = await Promise.all([
      axios.get(route("products.api")),
      axios.get(route("customers.api"))
    ])
    productOptions.value = (pRes.data.products ?? []).map((p: any) => ({
      label: p.name,
      value: String(p.id),
      price: Number(p.price)
    }))
    customerOptions.value = (cRes?.data?.customers ?? []).map((c: any) => ({
      label: c.name,
      value: String(c.id)
    }))
  } catch (err) {
    console.error("Options loading error", err)
  }
})

// helpers
const addRow = () => form.items.push({ product_id: "", quantity: 1, price: 0, subtotal: 0 })
const removeRow = (i: number) => form.items.splice(i, 1)
const setProductForRow = (row: any) => {
  const prod = productOptions.value.find((p) => p.value === row.product_id)
  row.price = prod ? prod.price : 0
  row.subtotal = row.price * row.quantity
}
const setQty = (row: any, qty: number) => {
  row.quantity = Math.max(1, qty)
  row.subtotal = row.price * row.quantity
}

// computed totals
const total = computed(() => form.items.reduce((s, r) => s + (Number(r.subtotal) || 0), 0))
const grandTotal = computed(() => {
  const subtotal = Number(total.value)
  const discount = Number(form.discount || 0)
  const tax = Number(form.tax || 0)
  return subtotal - discount + tax
})

// sync totals into form
watch([total, grandTotal], ([newSubtotal, newTotal]) => {
  form.subtotal = newSubtotal
  form.total = newTotal
})

// submit
const submit = (e: Event) => {
  e.preventDefault()
  form.post(route("inventories.store"), {
    preserveScroll: true,
    onSuccess: async (page) => {
      let inventory = page.props?.inventory
      if (inventory) inventoryStore.addLocal(inventory)
      else await inventoryStore.fetchInventories()

      inventoryStore.closeModal()

      if (inventory) invoiceStore.generateInvoice(inventory)
    },
    onFinish: () => form.reset()
  })
}
</script>

<template>
  <Dialog
    :open="inventoryStore.modalType === 'add'"
    @update:open="val => { if (!val) inventoryStore.closeModal() }"
  >
    <DialogContent
      class="sm:max-w-5xl max-w-[95vw] max-h-[90vh] flex flex-col"
    >
      <form class="flex-1 flex flex-col overflow-hidden" @submit="submit">
        <DialogHeader>
          <DialogTitle>New Transaction</DialogTitle>
        </DialogHeader>

        <!-- customer + payment method -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="customer">Customer</Label>
            <SearchableSelect
              id="customer"
              v-model="form.customer"
              :options="customerOptions"
              placeholder="Select a customer..."
              class="w-full"
            />
          </div>

          <div class="grid gap-2">
            <Label for="payment">Payment Method</Label>
            <select
              id="payment"
              v-model="form.payment_method"
              class="w-full rounded border px-3 py-2"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
        </div>

        <!-- rows wrapper (scrollable) -->
        <div class="mt-4 flex-1 overflow-y-auto space-y-4 rounded border border-gray-200 p-4 max-h-[200px]">
          <div
            v-for="(row, idx) in form.items"
            :key="idx"
            class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
          >
            <!-- Product -->
            <div class="sm:col-span-5">
              <Label>Product</Label>
              <SearchableSelect
                v-model="row.product_id"
                :options="productOptions"
                placeholder="Search and select a product..."
                class="w-full"
                @update:modelValue="() => setProductForRow(row)"
              />
            </div>

            <!-- Qty -->
            <div class="sm:col-span-2">
              <Label>Qty</Label>
              <div class="flex items-center gap-2">
                <button type="button" class="px-2 py-1 rounded border" @click="setQty(row, row.quantity - 1)">−</button>
                <Input type="number" v-model.number="row.quantity" @input="() => setQty(row, row.quantity)" class="w-20" />
                <button type="button" class="px-2 py-1 rounded border" @click="setQty(row, row.quantity + 1)">+</button>
              </div>
            </div>

            <!-- Unit Price -->
            <div class="sm:col-span-2">
              <Label>Unit Price</Label>
              <Input :value="row.price" disabled />
            </div>

            <!-- Subtotal -->
            <div class="sm:col-span-2">
              <Label>Subtotal</Label>
              <Input :value="row.subtotal" disabled />
            </div>

            <!-- Remove -->
            <div class="sm:col-span-1 flex justify-end">
              <Button
                type="button"
                variant="destructive"
                @click="removeRow(idx)"
                v-if="form.items.length > 1"
              >
                -
              </Button>
            </div>
          </div>
        </div>

        <!-- Add product button -->
        <div class="mt-2">
          <Button
            type="button"
            class="bg-green-500 hover:bg-green-600"
            @click="addRow"
          >
            + Add Product
          </Button>
        </div>

        <!-- footer section -->
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div class="grid gap-2">
            <Label>Note</Label>
            <Textarea v-model="form.note" placeholder="Optional note" class="h-32" />
          </div>

          <div class="space-y-2">
            <div class="flex justify-between">
              <div>Subtotal</div>
              <div>{{ total }}</div>
            </div>
            <div class="flex justify-between items-center">
              <div>Discount</div>
              <Input type="number" v-model.number="form.discount" class="w-32" />
            </div>
            <div class="flex justify-between items-center">
              <div>Tax</div>
              <Input type="number" v-model.number="form.tax" class="w-32" />
            </div>
            <div class="flex justify-between font-semibold">
              <div>Grand Total</div>
              <div>{{ grandTotal }}</div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" @click="inventoryStore.closeModal">Cancel</Button>
          <Button type="submit" :disabled="form.processing">Save</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
