<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import axios from 'axios'
import { useProduct } from '@/stores/products'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MultiSelect from '@/components/ui/multiselect/MultiSelect.vue'
import Select from '@/components/ui/select/Select.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'

const productStore = useProduct()

const props = defineProps({
  product: Object
})

const form = ref({
  name: '',
  category_ids: [],
  buying_price: '',
  retail_price: '',
  wholesale_price: '',
  brand: '',
  quantity: '',
  store_id: '',
  description: '',
  units_per_packet: 0,
  packets_per_carton: 0
})

const categories = ref([])
const stores = ref([])

onMounted(async () => {
  try {
    const [categoriesRes, storesRes] = await Promise.all([
      axios.get(route('categories.api')),
      axios.get(route('stores.api'))
    ])
    categories.value = categoriesRes.data.categories.map(c => ({
      label: c.name.charAt(0).toUpperCase() + c.name.slice(1),
      value: c.id
    }))
    stores.value = storesRes.data.stores.map(s => ({
      label: s.name.charAt(0).toUpperCase() + s.name.slice(1),
      value: s.id
    }))
  } catch (err) {
    console.error('Error fetching categories/stores:', err)
  }
})

// 🔥 Force reactivity even when fields are disabled
watch(
  () => props.product,
  (p) => {
    if (!p) return
    form.value = {
      name: p.name ?? '',
      category_ids: (p.categories ?? []).map(c => String(c.id)),
      buying_price: p.buying_price ?? '',
      retail_price: p.retail_price ?? '',
      wholesale_price: p.wholesale_price ?? '',
      brand: p.brand ?? '',
      quantity: p.quantity ?? '',
      store_id: p.store?.id ? String(p.store.id) : '',
      description: p.description ?? '',
      units_per_packet: Number(p.units_per_packet) || 0,
      packets_per_carton: Number(p.packets_per_carton) || 0
    }
  },
  { immediate: true, deep: true }
)

// ✅ Correct computed property (always reactive)
const computedTotalUnits = computed(() => {
  const units = Number(form.value.units_per_packet) || 0
  const packets = Number(form.value.packets_per_carton) || 0
  return units * packets
})
</script>

<template>
  <Dialog 
    :open="productStore.modalType === 'view'" 
    @update:open="val => { if (!val) productStore.closeModal() }"
  >
    <DialogContent
      class="w-full sm:max-w-6xl max-w-[calc(100%-1rem)] rounded-none sm:rounded-2xl h-auto max-h-[99vh] flex flex-col overflow-hidden p-0"
    >
      <DialogHeader
        class="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-white dark:bg-gray-800"
      >
        <DialogTitle class="text-lg sm:text-2xl font-semibold">
          View Product
        </DialogTitle>
      </DialogHeader>

      <!-- Scrollable body -->
      <div class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-gray-50 dark:bg-gray-900">
        
        <!-- BASIC INFO -->
        <div class="shadow-sm rounded-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 space-y-4">
          <h3 class="font-semibold text-base text-gray-700 dark:text-gray-200">Basic Information</h3>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Product Name</Label>
              <Input v-model="form.name" disabled />
            </div>
            <div>
              <Label>Brand</Label>
              <Input v-model="form.brand" disabled />
            </div>
          </div>

          <div class="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>Categories</Label>
              <MultiSelect v-model="form.category_ids" :options="categories" disabled />
            </div>
            <div>
              <Label>Quantity</Label>
              <Input v-model="form.quantity" type="number" disabled />
            </div>
            <div>
              <Label>Store</Label>
              <Select v-model="form.store_id" :options="stores" disabled />
            </div>
          </div>
        </div>

        <!-- INVENTORY -->
        <div class="shadow-sm rounded-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 space-y-4">
          <h3 class="font-semibold text-base text-gray-700 dark:text-gray-200">Inventory Details</h3>
          <div class="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>Units per Packet</Label>
              <Input v-model="form.units_per_packet" type="number" disabled />
            </div>
            <div>
              <Label>Packets per Carton</Label>
              <Input v-model="form.packets_per_carton" type="number" disabled />
            </div>
            <div>
              <Label>Total Units (calculated)</Label>
              <!-- ✅ Use readonly instead of disabled so value updates -->
              <Input :value="computedTotalUnits" readonly class="bg-gray-100 dark:bg-gray-700" />
            </div>
          </div>
        </div>

        <!-- PRICING -->
        <div class="shadow-sm rounded-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 space-y-4">
          <h3 class="font-semibold text-base text-gray-700 dark:text-gray-200">Pricing Details</h3>
          <div class="grid sm:grid-cols-3 gap-4">
            <div>
              <Label>Buying Price</Label>
              <Input v-model="form.buying_price" type="number" disabled />
            </div>
            <div>
              <Label>Wholesale Price</Label>
              <Input v-model="form.wholesale_price" type="number" disabled />
            </div>
            <div>
              <Label>Retail Price</Label>
              <Input v-model="form.retail_price" type="number" disabled />
            </div>
          </div>
        </div>

        <!-- DESCRIPTION -->
        <div class="shadow-sm rounded-2xl p-4 sm:p-6 bg-white dark:bg-gray-800 space-y-4">
          <h3 class="font-semibold text-base text-gray-700 dark:text-gray-200">Description</h3>
          <Textarea v-model="form.description" rows="3" disabled />
        </div>
      </div>

      <DialogFooter
        class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col sm:flex-row gap-2 sm:justify-end bg-white dark:bg-gray-900"
      >
        <Button variant="secondary" class="w-full sm:w-auto" @click="productStore.closeModal()">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
