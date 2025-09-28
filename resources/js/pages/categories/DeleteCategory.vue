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

import { useCategory } from "@/stores/categories";

const categoryStore = useCategory();
const loading = ref(false);
const error = ref<string | null>(null);

const handleDelete = async (e: Event) => {
  e.preventDefault();
  if (!categoryStore.selectedCategory?.id) {
    error.value = "No category selected.";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await categoryStore.deleteCategory(categoryStore.selectedCategory.id);
  } catch (err: any) {
    console.error("Error deleting category:", err);
    error.value = "Failed to delete category.";
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  error.value = null;
  categoryStore.closeModal();
};
</script>

<template>
  <Dialog
    :open="categoryStore.modalType === 'delete'"
    @update:open="val => { if (!val) categoryStore.closeModal() }"
  >
    <DialogContent>
      <form @submit="handleDelete" class="space-y-6">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this category?</DialogTitle>
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
