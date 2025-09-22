<script setup lang="ts">
import { computed } from 'vue'
import { useProduct } from '@/stores/products'

// Components
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

// Props
const props = defineProps<{
  product: {
    id: number
    name: string
    price: string
    brand: string
    quantity: string
    description?: string
    store?: { id: number; name: string }
    categories?: { id: number; name: string }[]
  } | null
}>()

// Map categories & store into simple options
const categoryOptions = computed(() =>
  props.product?.categories?.map(c => ({
    label: c.name,
    value: String(c.id),
  })) ?? []
)

const storeOption = computed(() =>
  props.product?.store
    ? [{ label: props.product.store.name, value: String(props.product.store.id) }]
    : []
)
</script>

<template>
  <Dialog
    :open="productStore.modalType === 'view'"
    @update:open="val => { if (!val) productStore.closeModal() }"
  >
    <DialogContent class="sm:max-w-2xl max-w-[calc(100%-2rem)]">
      <div class="space-y-6">
        <DialogHeader class="space-y-3">
          <DialogTitle>View Product</DialogTitle>
        </DialogHeader>

        <!-- Name -->
        <div class="grid gap-2">
          <Label>Name</Label>
          <Input :model-value="props.product?.name" disabled />
        </div>

        <!-- Categories -->
        <div class="grid gap-2">
          <Label>Categories</Label>
          <MultiSelect :model-value="categoryOptions.map(c => c.value)" :options="categoryOptions" disabled />
        </div>

        <!-- Price & Quantity -->
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label>Price</Label>
            <Input :model-value="props.product?.price" disabled />
          </div>
          <div class="grid gap-2">
            <Label>Quantity</Label>
            <Input :model-value="props.product?.quantity" disabled />
          </div>
        </div>

        <!-- Brand -->
        <div class="grid gap-2">
          <Label>Brand</Label>
          <Input :model-value="props.product?.brand" disabled />
        </div>

        <!-- Store -->
        <div class="grid gap-2">
          <Label>Store</Label>
          <Select :model-value="storeOption[0]?.value" :options="storeOption" disabled />
        </div>

        <!-- Description -->
        <div class="grid gap-2">
          <Label>Description</Label>
          <Textarea :model-value="props.product?.description" disabled />
        </div>

        <DialogFooter class="gap-2">
          <Button type="button" variant="secondary" @click="productStore.closeModal()">Close</Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
