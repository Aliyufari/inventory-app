<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useForm } from '@inertiajs/vue3'
import axios from 'axios'
import { useProduct } from '@/stores/products'

// Components
import InputError from '@/components/InputError.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MultiSelect from '@/components/ui/multiselect/MultiSelect.vue'
import Select from '@/components/ui/select/Select.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'

const productStore = useProduct()

const props = defineProps<{ product: any }>()

const form = useForm({
  name: '',
  category_ids: [] as string[],
  buying_price: '',
  retail_price: '',
  wholesale_price: '',
  brand: '',
  quantity: '',
  store_id: '',
  description: '',
  units_per_packet: '',
  packets_per_carton: ''
})

const categories = ref<{ label: string; value: string }[]>([])
const stores = ref<{ label: string; value: string }[]>([])

onMounted(async () => {
  try {
    const [categoriesRes, storesRes] = await Promise.all([
      axios.get(route('categories.api')),
      axios.get(route('stores.api'))
    ])

    categories.value = categoriesRes.data.categories.map((category: any) => ({
      label: category.name.charAt(0).toUpperCase() + category.name.slice(1),
      value: category.id,
    }))

    stores.value = storesRes.data.stores.map((store: any) => ({
      label: store.name.charAt(0).toUpperCase() + store.name.slice(1),
      value: store.id,
    }))
  } catch (error) {
    console.error('Error fetching categories/stores:', error)
  }
})

// Prefill form with selected product
watch(
  () => props.product,
  (p) => {
    if (p) {
      form.name = p.name ?? ''
      form.category_ids = (p.categories ?? []).map((c: any) => String(c.id))
      form.buying_price = p.buying_price ?? ''
      form.retail_price = p.retail_price ?? ''
      form.wholesale_price = p.wholesale_price ?? ''
      form.brand = p.brand ?? ''
      form.quantity = p.quantity ?? ''
      form.store_id = p.store?.id ? String(p.store.id) : ''
      form.description = p.description ?? ''
      form.units_per_packet = p.units_per_packet ?? ''
      form.packets_per_carton = p.packets_per_carton ?? ''
    }
  },
  { immediate: true }
)

// ✅ Computed total units (live)
const computedTotalUnits = computed(() => {
  const units = Number(form.units_per_packet) || 0
  const packets = Number(form.packets_per_carton) || 0
  if (units && packets) return units * packets
  return units || packets || 0
})

const updateProduct = (e: Event) => {
  e.preventDefault()
  if (!props.product?.id) return

  form.put(route('products.update', props.product.id), {
    preserveScroll: true,
    onSuccess: () => {
      productStore.fetchProducts()
      productStore.closeModal()
    },
  })
}
</script>

<template>
  <Dialog
    :open="productStore.modalType === 'edit'"
    @update:open="val => { if (!val) productStore.closeModal() }"
  >
    <DialogContent
      class="
        w-full
        sm:max-w-6xl
        max-w-[calc(100%-1rem)]
        rounded-none sm:rounded-2xl
        h-auto
        max-h-[99vh]
        flex flex-col
        overflow-hidden
        p-0
      "
    >
      <!-- Header -->
      <DialogHeader
        class="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 p-4 sm:p-6 bg-white dark:bg-gray-800"
      >
        <DialogTitle class="text-lg sm:text-2xl font-semibold">
          Edit Product
        </DialogTitle>
      </DialogHeader>

      <!-- Form -->
      <form class="flex flex-col flex-1 overflow-hidden" @submit="updateProduct">
        <!-- Scrollable Body -->
        <div class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-gray-50 dark:bg-gray-900">
          
          <!-- ✅ BASIC INFO -->
          <div class="shadow-sm rounded-2xl p-4 sm:p-6 space-y-4 bg-white dark:bg-gray-800">
            <h3 class="font-semibold text-base text-gray-700 dark:text-gray-200">
              Basic Information
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="grid gap-2">
                <Label for="name">Product Name</Label>
                <Input id="name" v-model="form.name" placeholder="e.g., Paracetamol" />
                <InputError :message="form.errors.name" />
              </div>
              <div class="grid gap-2">
                <Label for="brand">Brand</Label>
                <Input id="brand" v-model="form.brand" placeholder="e.g., Emzor" />
                <InputError :message="form.errors.brand" />
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="grid gap-2">
                <Label for="category_ids">Categories</Label>
                <MultiSelect
                  id="category_ids"
                  placeholder="Select categories"
                  v-model="form.category_ids"
                  :options="categories"
                />
                <InputError :message="form.errors.category_ids" />
              </div>
              <div class="grid gap-2">
                <Label for="quantity">Quantity (Base Units)</Label>
                <Input id="quantity" type="number" v-model="form.quantity" placeholder="e.g., 200" />
                <InputError :message="form.errors.quantity" />
              </div>
              <div class="grid gap-2">
                <Label for="store_id">Store</Label>
                <Select
                  id="store_id"
                  placeholder="Select store"
                  v-model="form.store_id"
                  :options="stores"
                />
                <InputError :message="form.errors.store_id" />
              </div>
            </div>
          </div>

          <!-- ✅ INVENTORY DETAILS -->
          <div class="shadow-sm rounded-2xl p-4 sm:p-6 space-y-4 bg-white dark:bg-gray-800">
            <h3 class="font-semibold text-base text-gray-700 dark:text-gray-200">
              Inventory Details
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="grid gap-2">
                <Label for="units_per_packet">Units per Packet</Label>
                <Input id="units_per_packet" type="number" v-model="form.units_per_packet" placeholder="e.g., 10" />
                <InputError :message="form.errors.units_per_packet" />
              </div>

              <div class="grid gap-2">
                <Label for="packets_per_carton">Packets per Carton</Label>
                <Input id="packets_per_carton" type="number" v-model="form.packets_per_carton" placeholder="e.g., 12" />
                <InputError :message="form.errors.packets_per_carton" />
              </div>

              <div class="grid gap-2">
                <Label for="quantity_total">Total Units (calculated)</Label>
                <Input 
                  id="quantity_total" 
                  :value="computedTotalUnits" 
                  readonly 
                  class="bg-gray-100 dark:bg-gray-700"
                />
              </div>
            </div>
          </div>

          <!-- ✅ PRICING DETAILS -->
          <div class="shadow-sm rounded-2xl p-4 sm:p-6 space-y-4 bg-white dark:bg-gray-800">
            <h3 class="font-semibold text-base text-gray-700 dark:text-gray-200">
              Pricing Details
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="grid gap-2">
                <Label for="buying_price">Buying Price</Label>
                <Input id="buying_price" type="number" v-model="form.buying_price" placeholder="e.g., 500.00" />
                <InputError :message="form.errors.buying_price" />
              </div>
              <div class="grid gap-2">
                <Label for="wholesale_price">Wholesale Price</Label>
                <Input id="wholesale_price" type="number" v-model="form.wholesale_price" placeholder="e.g., 650.00" />
                <InputError :message="form.errors.wholesale_price" />
              </div>
              <div class="grid gap-2">
                <Label for="retail_price">Retail Price</Label>
                <Input id="retail_price" type="number" v-model="form.retail_price" placeholder="e.g., 800.00" />
                <InputError :message="form.errors.retail_price" />
              </div>
            </div>
          </div>

          <!-- ✅ DESCRIPTION -->
          <div class="shadow-sm rounded-2xl p-4 sm:p-6 space-y-4 bg-white dark:bg-gray-800">
            <h3 class="font-semibold text-base text-gray-700 dark:text-gray-200">
              Description
            </h3>
            <Textarea
              id="description"
              v-model="form.description"
              placeholder="Brief description or notes..."
              rows="3"
              class="resize-none"
            />
            <InputError :message="form.errors.description" />
          </div>
        </div>

        <!-- Footer -->
        <DialogFooter
          class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 flex flex-col sm:flex-row gap-2 sm:justify-end bg-white dark:bg-gray-900"
        >
          <Button
            type="button"
            variant="secondary"
            class="w-full sm:w-auto"
            @click="productStore.closeModal()"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :disabled="form.processing"
            class="w-full sm:w-auto"
          >
            Update Product
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
