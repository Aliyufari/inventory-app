<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import { useProduct } from '@/stores/products'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MultiSelect from '@/components/ui/multiselect/MultiSelect.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import Select from '@/components/ui/select/Select.vue'
import Modal from '@/components/AppModal.vue'
import { Button } from '@/components/ui/button'

const productStore = useProduct()
const props = defineProps<{ product: any }>()

const imagePreview = ref<string | null>(null)
const categories = computed(() => productStore.allCategories)
const stores = computed(() => productStore.allStores)

const form = ref({
  name: '',
  barcode: '',
  category_ids: [] as string[],
  cost: '',
  retail_price: '',
  wholesale_price: '',
  brand: '',
  unit: 'pcs',
  units_per_packet: '',
  packets_per_carton: '',
  quantity: '',
  store_id: '',
  description: '',
  status: true,
  allow_wholesale: true,
})

const showViewModal = computed({
  get: () => productStore.modalType === 'view',
  set: (val) => {
    if (!val) productStore.closeModal()
  }
})

const computedTotalUnits = computed(() => {
  const u = Number(form.value.units_per_packet) || 0
  const p = Number(form.value.packets_per_carton) || 0
  return u * p || u || p || 0
})

onMounted(async () => {
  try {
    const [categoriesRes, storesRes] = await Promise.all([
      axios.get(route('categories.api')),
      axios.get(route('stores.api'))
    ])

    categories.value = categoriesRes.data.categories.map((c: any) => ({
      label: c.name.charAt(0).toUpperCase() + c.name.slice(1),
      value: String(c.id),
    }))

    stores.value = storesRes.data.stores.map((s: any) => ({
      label: s.name.charAt(0).toUpperCase() + s.name.slice(1),
      value: String(s.id),
    }))
  } catch (error) {
    console.error('Error fetching categories/stores:', error)
  }
})

watch(
  () => props.product,
  (p) => {
    if (!p) return

    form.value.name = p.name ?? ''
    form.value.barcode = p.barcode ?? ''
    form.value.category_ids = (p.categories ?? []).map((c: any) => String(c.id))
    form.value.cost = String(p.cost ?? '')
    form.value.retail_price = String(p.retail_price ?? '')
    form.value.wholesale_price = String(p.wholesale_price ?? '')
    form.value.brand = p.brand ?? ''
    form.value.unit = p.unit ?? 'pcs'
    form.value.quantity = String(p.quantity ?? '')
    form.value.store_id = p.store?.id ? String(p.store.id) : ''
    form.value.description = p.description ?? ''
    form.value.units_per_packet = String(p.units_per_packet ?? '')
    form.value.packets_per_carton = String(p.packets_per_carton ?? '')
    form.value.status = p.status ?? true
    form.value.allow_wholesale = p.allow_wholesale ?? true
    imagePreview.value = p.image ?? null
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <Modal v-model="showViewModal" title="View Product" width="500px">
    <div class="flex-1 flex flex-col py-5 space-y-5">

      <!-- Product Image -->
      <div class="space-y-2">
        <Label>Product Image</Label>
        <div class="h-40 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center relative overflow-hidden">
          <div v-if="!imagePreview" class="text-gray-400 dark:text-gray-500 text-sm">No image</div>
          <img v-if="imagePreview" :src="imagePreview" class="absolute inset-0 w-full h-full object-cover rounded-xl"/>
        </div>
      </div>

      <!-- Barcode -->
      <div class="space-y-2">
        <Label for="barcode">Barcode</Label>
        <Input id="barcode" v-model="form.barcode" disabled/>
      </div>

      <!-- Name & Brand -->
      <div class="space-y-2">
        <Label for="name">Product Name</Label>
        <Input id="name" v-model="form.name" disabled/>
      </div>
      <div class="space-y-2">
        <Label for="brand">Brand</Label>
        <Input id="brand" v-model="form.brand" disabled/>
      </div>

      <!-- Categories -->
      <div class="space-y-2">
        <Label>Categories</Label>
        <MultiSelect v-model="form.category_ids" :options="categories" disabled/>
      </div>

      <!-- Unit Type -->
      <div class="space-y-2">
        <Label>Unit Type</Label>
        <Select v-model="form.unit" :options="[
          { label: 'pcs', value: 'pcs' },
          { label: 'kg', value: 'kg' },
          { label: 'litre', value: 'litre' },
          { label: 'pack', value: 'pack' },
          { label: 'box', value: 'box' },
        ]" disabled/>
      </div>

      <!-- Units -->
      <div class="grid grid-cols-3 gap-3">
        <div class="space-y-2">
          <Label>Units / Packet</Label>
          <Input type="number" v-model="form.units_per_packet" disabled/>
        </div>
        <div class="space-y-2">
          <Label>Packets / Carton</Label>
          <Input type="number" v-model="form.packets_per_carton" disabled/>
        </div>
        <div class="space-y-2">
          <Label>Total Units</Label>
          <Input :value="computedTotalUnits" readonly class="bg-gray-100 dark:bg-gray-700"/>
        </div>
      </div>

      <!-- Prices -->
      <div class="grid grid-cols-3 gap-3">
        <div class="space-y-2">
          <Label>Cost Price</Label>
          <Input type="number" v-model="form.cost" disabled/>
        </div>
        <div class="space-y-2">
          <Label>Wholesale Price</Label>
          <Input type="number" v-model="form.wholesale_price" disabled/>
        </div>
        <div class="space-y-2">
          <Label>Retail Price</Label>
          <Input type="number" v-model="form.retail_price" disabled/>
        </div>
      </div>

      <!-- Store & Stock -->
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <Label>Store</Label>
          <Select v-model="form.store_id" :options="stores" disabled/>
        </div>
        <div class="space-y-2">
          <Label>Min Stock Level</Label>
          <Input type="number" :value="form.quantity" disabled/>
        </div>
      </div>

      <!-- Status & Wholesale -->
      <div class="flex gap-4">
        <div class="flex items-center gap-2">
          <label class="relative inline-flex items-center cursor-not-allowed opacity-60">
            <input type="checkbox" v-model="form.status" class="sr-only" disabled/>
            <div class="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5"></div>
            <span class="ml-3 text-sm font-medium text-gray-700 select-none">Active</span>
          </label>
        </div>

        <div class="flex items-center gap-2">
          <label class="relative inline-flex items-center cursor-not-allowed opacity-60">
            <input type="checkbox" v-model="form.allow_wholesale" class="sr-only" disabled/>
            <div class="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-600"></div>
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform peer-checked:translate-x-5"></div>
            <span class="ml-3 text-sm font-medium text-gray-700 select-none">Allow Wholesale</span>
          </label>
        </div>
      </div>

      <!-- Description -->
      <div class="space-y-2">
        <Label>Description</Label>
        <Textarea v-model="form.description" rows="3" disabled/>
      </div>

    </div>

    <template #footer>
      <Button variant="ghost" @click="showViewModal = false" class="min-w-[120px]">Close</Button>
    </template>
  </Modal>
</template>
