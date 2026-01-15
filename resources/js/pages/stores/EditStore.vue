<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { watch } from 'vue'
import { useProduct } from '@/stores/products'

// Components
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import InputError from '@/components/InputError.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import MultiSelect from '@/components/ui/multiselect/MultiSelect.vue'
import Select from '@/components/ui/select/Select.vue'

const productStore = useProduct()

const form = useForm({
  name: '',
  category_ids: [] as string[],
  price: '',
  brand: '',
  quantity: '',
  store_id: '',
  description: '',
})

// ✅ Prefill when selected product changes
watch(
  () => productStore.selected,
  (product) => {
    if (product) {
      form.name = product.name ?? ''
      form.category_ids = product.categories?.map((c: any) => String(c.id)) ?? []
      form.price = product.price ?? ''
      form.brand = product.brand ?? ''
      form.quantity = product.quantity ?? ''
      form.store_id = product.store_id ? String(product.store_id) : ''
      form.description = product.description ?? ''
    }
  },
  { immediate: true }
)

const updateProduct = (e: Event) => {
  e.preventDefault()

  form.put(route('products.update', productStore.selected?.id), {
    onSuccess: (page) => {
      if (page.props?.product) {
        productStore.updateLocal(page.props.product)
      } else {
        productStore.getProducts()
      }
      productStore.closeModal()
    },
    onFinish: () => form.reset(),
  })
}
</script>

<template>
  <Dialog
    :open="productStore.modalType === 'edit'"
    @update:open="val => { if (!val) productStore.closeModal() }"
  >
    <DialogContent class="sm:max-w-2xl">
      <form @submit="updateProduct" class="space-y-6">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <!-- Name -->
        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="form.name" type="text" placeholder="Name" />
          <InputError :message="form.errors.name" />
        </div>

        <!-- Categories -->
        <div class="grid gap-2">
          <Label for="category_ids">Categories</Label>
          <MultiSelect
            id="category_ids"
            placeholder="Select categories"
            v-model="form.category_ids"
            :options="productStore.categoryOptions"
          />
          <InputError :message="form.errors.category_ids" />
        </div>

        <!-- Price & Quantity -->
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="price">Price</Label>
            <Input id="price" v-model="form.price" type="number" placeholder="Product Price" />
            <InputError :message="form.errors.price" />
          </div>
          <div class="grid gap-2">
            <Label for="quantity">Quantity</Label>
            <Input id="quantity" v-model="form.quantity" type="number" placeholder="Product Quantity" />
            <InputError :message="form.errors.quantity" />
          </div>
        </div>

        <!-- Brand -->
        <div class="grid gap-2">
          <Label for="brand">Brand</Label>
          <Input id="brand" v-model="form.brand" type="text" placeholder="Product Brand" />
          <InputError :message="form.errors.brand" />
        </div>

        <!-- Store -->
        <div class="grid gap-2">
          <Label for="store_id">Store</Label>
          <Select
            id="store_id"
            v-model="form.store_id"
            placeholder="Select store"
            :options="productStore.storeOptions"
          />
          <InputError :message="form.errors.store_id" />
        </div>

        <!-- Description -->
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="form.description"
            placeholder="Description"
          />
          <InputError :message="form.errors.description" />
        </div>

        <!-- Actions -->
        <div class="flex gap-2 justify-end">
          <Button type="button" variant="secondary" @click="productStore.closeModal()">Cancel</Button>
          <Button type="submit" :disabled="form.processing">Update</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
