<script setup lang="ts">
import { ref, onMounted } from 'vue'
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

// Pinia store
const productStore = useProduct()

// Form state
const form = useForm({
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

// Options for selects
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

const addProduct = (e: Event) => {
  e.preventDefault()

  form.post(route('products.store'), {
    preserveScroll: true,
    onSuccess: (page) => {
      if (page.props?.product) {
        productStore.products.unshift(page.props.product)
      } else {
        productStore.fetchProducts()
      }
      productStore.closeModal()
    },
    onFinish: () => form.reset(),
  })
}
</script>

<template>
  <Dialog 
    :open="productStore.modalType === 'add'" 
    @update:open="val => { if (!val) productStore.closeModal() }"
  >
    <!-- Responsive modal height -->
    <DialogContent
      class="
        w-full 
        sm:max-w-5xl   <!-- Increased from 2xl to 5xl -->
        max-w-[calc(100%-1rem)] 
        rounded-none sm:rounded-2xl 
        h-[100vh] sm:h-auto 
        overflow-y-auto 
        p-4 sm:p-6
      "
    >
      <form class="space-y-6" @submit="addProduct">
        <DialogHeader class="space-y-3 text-center sm:text-left">
          <DialogTitle class="text-lg sm:text-xl font-semibold">
            Add Product
          </DialogTitle>
        </DialogHeader>

        <!-- Name -->
        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input id="name" type="text" v-model="form.name" placeholder="Product Name" />
          <InputError :message="form.errors.name" />
        </div>

        <!-- Brand -->
        <div class="grid gap-2">
          <Label for="brand">Brand</Label>
          <Input id="brand" type="text" v-model="form.brand" placeholder="Product Brand" />
          <InputError :message="form.errors.brand" />
        </div>

        <!-- Categories & Stores -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <Label for="store_id">Store</Label>
            <Select
              id="store_id"
              placeholder="Select store"
              v-model="form.store_id"
              :options="stores"
            />
            <InputError :message="form.errors.store_id" />
          </div>
          <div class="grid gap-2">
            <Label for="quantity">Quantity</Label>
            <Input 
              id="quantity" 
              type="number" 
              v-model="form.quantity" 
              placeholder="Product Quantity" 
            />
            <InputError :message="form.errors.quantity" />
          </div>
        </div>

        <!-- Price & Quantity in one row -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="grid gap-2">
            <Label for="buying_price">Buying Price</Label>
            <Input 
              id="buying_price" 
              type="number" 
              v-model="form.buying_price" 
              placeholder="Buying Price" 
            />
            <InputError :message="form.errors.buying_price" />
          </div>
          <div class="grid gap-2">
            <Label for="wholesale_price">Wholesale Price</Label>
            <Input 
              id="wholesale_price" 
              type="number" 
              v-model="form.wholesale_price" 
              placeholder="Wholesale Price" 
            />
            <InputError :message="form.errors.wholesale_price" />
          </div>
          <div class="grid gap-2">
            <Label for="retail_price">Retail Price</Label>
            <Input 
              id="retail_price" 
              type="number" 
              v-model="form.retail_price" 
              placeholder="Retail Price" 
            />
            <InputError :message="form.errors.retail_price" />
          </div>
        </div>

        <!-- Description -->
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="form.description"
            placeholder="Description"
            class="resize-none"
            rows="3"
          />
          <InputError :message="form.errors.description" />
        </div>

        <!-- Footer Buttons -->
        <DialogFooter class="flex flex-col sm:flex-row gap-2 sm:justify-end">
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
            Submit
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
