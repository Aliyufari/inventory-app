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
import { Select } from '@/components/ui/select'

// Pinia store
const productStore = useProduct()

// Form state
const form = useForm({
  name: '',
  category_id: '',
  price: '',
  brand: '',
  quantity: '',
  store_id: '',
  description: ''
})

// Options for selects
const categories = ref<{ label: string; value: number }[]>([])
const stores = ref<{ label: string; value: number }[]>([])

onMounted(async () => {
  try {
    const [categoriesRes, storesRes] = await Promise.all([
      axios.get(route('categories.index')),
      axios.get(route('stores.index'))
    ])

    console.log("Debug: ", categoriesRes.data.categories, storesRes.data.stores);

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
  <div class="space-y-6">
    <Dialog 
      :open="productStore.modalType === 'add'" 
      @update:open="val => { if (!val) productStore.closeModal() }"
    >
      <DialogContent>
        <form class="space-y-6" @submit="addProduct">
          <DialogHeader class="space-y-3">
            <DialogTitle>Add product</DialogTitle>
          </DialogHeader>

          <!-- Name -->
          <div class="grid gap-2">
            <Label for="name" class="sr-only">Name</Label>
            <Input id="name" type="text" v-model="form.name" placeholder="Name" />
            <InputError :message="form.errors.name" />
          </div>

          <!-- Category -->
          <div class="grid gap-2">
            <Label for="category_id" class="sr-only">Category</Label>
            <Select
              id="category_id"
              placeholder="Select category"
              v-model="form.category_id"
              :options="categories"
            />
            <InputError :message="form.errors.category_id" />
          </div>

          <!-- Price -->
          <div class="grid gap-2">
            <Label for="price" class="sr-only">Price</Label>
            <Input id="price" type="number" v-model="form.price" placeholder="Product Price" />
            <InputError :message="form.errors.price" />
          </div>

          <!-- Brand -->
          <div class="grid gap-2">
            <Label for="brand" class="sr-only">Brand</Label>
            <Input id="brand" type="text" v-model="form.brand" placeholder="Product Brand" />
            <InputError :message="form.errors.brand" />
          </div>

          <!-- Quantity -->
          <div class="grid gap-2">
            <Label for="quantity" class="sr-only">Quantity</Label>
            <Input id="quantity" type="number" v-model="form.quantity" placeholder="Product Quantity" />
            <InputError :message="form.errors.quantity" />
          </div>

          <!-- Store -->
          <div class="grid gap-2">
            <Label for="store_id" class="sr-only">Store</Label>
            <Select
              id="store_id"
              placeholder="Select store"
              v-model="form.store_id"
              :options="stores"
            />
            <InputError :message="form.errors.store_id" />
          </div>

          <div class="grid gap-2">
            <Label for="description" class="sr-only">Description</Label>
            <Textarea
              id="description"
              v-model="form.description"
              placeholder="How to use"
            />
            <InputError :message="form.errors.description" />
          </div>


          <DialogFooter class="gap-2">
            <Button type="button" variant="secondary" @click="productStore.closeModal()">Cancel</Button>
            <Button type="submit" :disabled="form.processing">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
