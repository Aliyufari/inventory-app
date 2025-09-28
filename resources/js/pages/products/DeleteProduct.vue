<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useProduct } from "@/stores/products";

const productStore = useProduct();
const loading = ref(false);
const error = ref<string | null>(null);

const handleDelete = async (e: Event) => {
  e.preventDefault();
  if (!productStore.selectedProduct?.id) {
    error.value = "No product selected.";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await productStore.deleteProduct(productStore.selectedProduct.id);
  } catch (err: any) {
    console.error("Error deleting product:", err);
    error.value = "Failed to delete product.";
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  error.value = null;
  productStore.closeModal();
};
</script>

<template>
  <Dialog
    :open="productStore.modalType === 'delete'"
    @update:open="val => { if (!val) productStore.closeModal() }"
  >
    <DialogContent>
      <form @submit="handleDelete" class="space-y-6">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this product?</DialogTitle>
          <DialogDescription>This action cannot be reverted.</DialogDescription>
        </DialogHeader>

        <DialogFooter class="gap-2">
          <Button type="button" variant="secondary" @click="closeModal">
            Cancel
          </Button>
          <Button type="submit" variant="destructive" :disabled="loading">
            Delete
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
