<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue"
import { useForm } from "@inertiajs/vue3"
import axios from "axios"
import { useInventory } from "@/stores/inventory"
import { useInvoiceStore } from "@/stores/invoces"

// Components
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Select from "@/components/ui/select/Select.vue"
import MultiSelect from "@/components/ui/multiselect/MultiSelect.vue"
import Textarea from "@/components/ui/textarea/Textarea.vue"
import InputError from "@/components/InputError.vue"

const inventoryStore = useInventory()
const invoiceStore = useInvoiceStore()

// product options come from API
const productOptions = ref<{ label: string; value: string; price: number }[]>([])
const customerOptions = ref<{ label: string; value: string }[]>([])

// form
const form = useForm({
  customer_id: "",
  items: [] as { product_id?: string; quantity: number; price: number; subtotal: number }[],
  discount: 0,
  note: ""
})

if (!form.items.length) form.items.push({ product_id: undefined, quantity: 1, price: 0, subtotal: 0 })

onMounted(async () => {
  try {
    const [pRes, cRes] = await Promise.all([
      axios.get(route("products.api")), 
      axios.get(route("customers.api")) 
    ])
    productOptions.value = (pRes.data.products ?? []).map((p: any) => ({ label: p.name, value: String(p.id), price: Number(p.price) }))
    customerOptions.value = (cRes?.data?.customers ?? []).map((c: any) => ({ label: c.name, value: String(c.id) }))
  } catch (err) {
    console.error("Options loading error", err)
  }
})

// helpers
const addRow = () => form.items.push({ product_id: undefined, quantity: 1, price: 0, subtotal: 0 })
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
const total = computed(() => form.items.reduce((s: number, r: any) => s + (Number(r.subtotal) || 0), 0))
const grandTotal = computed(() => Number(total.value) - Number(form.discount || 0))

// submit
const submit = (e: Event) => {
  e.preventDefault()
  form.post(route("inventories.store"), {
    preserveScroll: true,
    onSuccess: async (page) => {
      let inventory = page.props?.inventory
      if (inventory) inventoryStore.addLocal(inventory)
      else await inventoryStore.fetchInventories()
      
      // close inventory modal
      inventoryStore.closeModal()

      // after modal closes, generate invoice PDF
      if (inventory) {
        invoiceStore.generateInvoice(inventory)
      }
    },
    onFinish: () => form.reset()
  })
}
</script>

<template>
  <Dialog :open="inventoryStore.modalType === 'add'" @update:open="val => { if (!val) inventoryStore.closeModal() }">
    <DialogContent class="sm:max-w-4xl max-w-[calc(100%-2rem)]">
      <form class="space-y-6" @submit="submit">
        <DialogHeader><DialogTitle>New Transaction</DialogTitle></DialogHeader>

        <!-- customer -->
        <div class="grid gap-2">
          <Label for="customer">Customer</Label>
          <Select id="customer" v-model="form.customer_id" :options="customerOptions" placeholder="Select customer (optional)" />
        </div>
        
        <!-- rows wrapper (scrollable if >2 rows) -->
        <div
          class="space-y-4 overflow-y-auto"
          :style="{
            maxHeight: form.items.length > 2 ? 'calc(2 * 4rem)' : 'auto'
          }"
        >
          <div
            v-for="(row, idx) in form.items"
            :key="idx"
            class="grid grid-cols-12 gap-3 items-end"
          >
            <!-- Product -->
            <div class="col-span-5">
              <Label>Product</Label>
              <Select
                v-model="row.product_id"
                :options="productOptions"
                @update:model-value="() => setProductForRow(row)"
                placeholder="Choose product"
              />
            </div>

            <!-- Qty -->
            <div class="col-span-2">
              <Label>Qty</Label>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="px-2 py-1 rounded border"
                  @click="setQty(row, row.quantity - 1)"
                >
                  −
                </button>
                <Input
                  type="number"
                  v-model.number="row.quantity"
                  @input="() => setQty(row, row.quantity)"
                  class="w-20"
                />
                <button
                  type="button"
                  class="px-2 py-1 rounded border"
                  @click="setQty(row, row.quantity + 1)"
                >
                  +
                </button>
              </div>
            </div>

            <!-- Unit Price -->
            <div class="col-span-3">
              <Label>Unit Price</Label>
              <Input :value="row.price" disabled />
            </div>

            <!-- Subtotal -->
            <div class="col-span-1">
              <Label>Subtotal</Label>
              <Input :value="row.subtotal" disabled />
            </div>

            <!-- Remove -->
            <div class="col-span-1 flex justify-end">
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

        <!-- Add Product button (outside scrollable area) -->
        <div class="mt-2">
          <Button
            type="button"
            class="bg-green-500 hover:bg-green-600"
            @click="addRow"
          >
            + Add Product
          </Button>
        </div>

        <!-- totals -->
        <div class="mt-4 space-y-2">
          <div class="flex justify-between">
            <div>Total</div>
            <div>{{ total }}</div>
          </div>

          <div class="flex justify-between items-center">
            <div>Discount</div>
            <div class="flex items-center gap-2">
              <Input type="number" v-model.number="form.discount" class="w-32" />
            </div>
          </div>

          <div class="flex justify-between font-semibold">
            <div>Grand Total</div>
            <div>{{ grandTotal }}</div>
          </div>
        </div>

        <div class="grid gap-2">
          <Label>Note</Label>
          <Textarea v-model="form.note" placeholder="Optional note" />
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" @click="inventoryStore.closeModal">Cancel</Button>
          <Button type="submit" :disabled="form.processing">Save</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  <!-- Slide-out invoice panel -->
<transition name="slide-right">
  <div 
    v-if="invoiceStore.invoicePDFDataURL" 
    class="fixed top-0 right-0 h-full w-[400px] bg-white shadow-lg z-50 overflow-auto"
  >
    <iframe :src="invoiceStore.invoicePDFDataURL" class="w-full h-full"></iframe>
    <button class="absolute top-2 right-2 text-red-500" @click="invoiceStore.clearInvoice()">✕</button>
  </div>
</transition>
</template>

<style scoped>
.slide-right-enter-active, .slide-right-leave-active {
  transition: transform 0.3s ease;
}
.slide-right-enter-from, .slide-right-leave-to {
  transform: translateX(100%);
}
.slide-right-enter-to, .slide-right-leave-from {
  transform: translateX(0);
}
</style>
