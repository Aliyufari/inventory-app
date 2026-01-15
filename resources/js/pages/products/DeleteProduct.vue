<script setup lang="ts">
import { ref } from "vue"
import { useProduct } from "@/stores/products"
import { toast } from "vue-sonner"
import Prompt from "@/components/ui/Prompt.vue"

const productStore = useProduct()
const emit = defineEmits<{
  (e: 'deleted'): void
}>()

const loading = ref(false)
const showPrompt = ref(true)

const handleDelete = async () => {
  const product = productStore.selectedProduct
  if (!product?.id) {
    toast.error("No product selected")
    return
  }

  loading.value = true
  try {
    await productStore.deleteProduct(product.id)
    emit('deleted')
    showPrompt.value = false
  } catch (err: any) {
    console.error("Delete failed:", err)
  } finally {
    loading.value = false
  }
}

const closePrompt = () => {
  showPrompt.value = false
  productStore.closeModal()
}
</script>

<template>
  <Prompt
    v-model="showPrompt"
    title="Delete Product"
    :message="`Are you sure you want to delete '${productStore.selectedProduct?.name}'?`"
    confirmText="Delete"
    cancelText="Cancel"
    danger
    :loading="loading"
    @confirm="handleDelete"
    @cancel="closePrompt"
  />
</template>
