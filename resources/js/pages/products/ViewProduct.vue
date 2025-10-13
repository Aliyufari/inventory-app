<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useProduct } from '@/stores/products'

// Components
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MultiSelect from '@/components/ui/multiselect/MultiSelect.vue'
import Select from '@/components/ui/select/Select.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'

// Pinia store
const productStore = useProduct()

// Props
const props = defineProps<{ product: any }>()

// Form state (readonly)
const form = ref({
  name: '',
  category_ids: [] as string[],
  buying_price: '',
  retail_price: '',
  wholesale_price: '',
  brand: '',
  quantity: '',
  store_id: '',
  description: ''
})

// Options
const categories = ref<{ label: string; value: string }[]>([])
const stores = ref<{ label: string; value: string }[]>([])

// Fetch categories and stores
onMounted(async () => {
  try {
    const [categoriesRes, storesRes] = await Promise.all([
      axios.get(route('categories.api')),
      axios.get(route('stores.api'))
    ])

    categories.value = categoriesRes.data.categories.map((c: any) => ({
      label: c.name.charAt(0).toUpperCase() + c.name.slice(1),
      value: c.id,
    }))

    stores.value = storesRes.data.stores.map((s: any) => ({
      label: s.name.charAt(0).toUpperCase() + s.name.slice(1),
      value: s.id,
    }))
  } catch (error) {
    console.error('Error fetching categories/stores:', error)
  }
})

// Prefill data when product changes
watch(
  () => props.product,
  (p) => {
    if (p) {
      form.value.name = p.name ?? ''
      form.value.category_ids = (p.categories ?? []).map((c: any) => String(c.id))
      form.value.buying_price = p.buying_price ?? ''
      form.value.retail_price = p.retail_price ?? ''
      form.value.wholesale_price = p.wholesale_price ?? ''
      form.value.brand = p.brand ?? ''
      form.value.quantity = p.quantity ?? ''
      form.value.store_id = p.store?.id ? String(p.store.id) : ''
      form.value.description = p.description ?? ''
    }
  },
  { immediate: true }
)
</script>

<template>
  <Dialog 
    :open="productStore.modalType === 'view'" 
    @update:open="val => { if (!val) productStore.closeModal() }"
  >
    <DialogContent
      class="
        w-full 
        sm:max-w-5xl 
        max-w-[calc(100%-1rem)] 
        rounded-none sm:rounded-2xl 
        h-[100vh] sm:h-auto 
        overflow-y-auto 
        p-4 sm:p-6
      "
    >
      <div class="space-y-6">
        <DialogHeader class="space-y-3 text-center sm:text-left">
          <DialogTitle class="text-lg sm:text-xl font-semibold">
            View Product
          </DialogTitle>
        </DialogHeader>

        <!-- Name -->
        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input id="name" type="text" v-model="form.name" disabled />
        </div>

        <!-- Brand -->
        <div class="grid gap-2">
          <Label for="brand">Brand</Label>
          <Input id="brand" type="text" v-model="form.brand" disabled />
        </div>

        <!-- Categories & Store & Quantity -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="grid gap-2">
            <Label for="category_ids">Categories</Label>
            <MultiSelect
              id="category_ids"
              v-model="form.category_ids"
              :options="categories"
              disabled
            />
          </div>
          <div class="grid gap-2">
            <Label for="store_id">Store</Label>
            <Select
              id="store_id"
              v-model="form.store_id"
              :options="stores"
              disabled
            />
          </div>
          <div class="grid gap-2">
            <Label for="quantity">Quantity</Label>
            <Input 
              id="quantity" 
              type="number" 
              v-model="form.quantity"
              disabled 
            />
          </div>
        </div>

        <!-- Prices -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="grid gap-2">
            <Label for="buying_price">Buying Price</Label>
            <Input id="buying_price" type="number" v-model="form.buying_price" disabled />
          </div>
          <div class="grid gap-2">
            <Label for="wholesale_price">Wholesale Price</Label>
            <Input id="wholesale_price" type="number" v-model="form.wholesale_price" disabled />
          </div>
          <div class="grid gap-2">
            <Label for="retail_price">Retail Price</Label>
            <Input id="retail_price" type="number" v-model="form.retail_price" disabled />
          </div>
        </div>

        <!-- Description -->
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="form.description"
            class="resize-none"
            rows="3"
            disabled
          />
        </div>

        <!-- Footer -->
        <DialogFooter class="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <Button 
            type="button" 
            variant="secondary" 
            class="w-full sm:w-auto" 
            @click="productStore.closeModal()"
          >
            Close
          </Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
