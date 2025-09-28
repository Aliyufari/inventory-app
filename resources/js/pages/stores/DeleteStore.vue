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

import { useStore } from "@/stores/stores";

const storeStore = useStore();
const loading = ref(false);
const error = ref<string | null>(null);

const handleDelete = async (e: Event) => {
  e.preventDefault();
  if (!storeStore.selectedStore?.id) {
    error.value = "No store selected.";
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    await storeStore.deleteStore(storeStore.selectedStore.id);
  } catch (err: any) {
    console.error("Error deleting store:", err);
    error.value = "Failed to delete store.";
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  error.value = null;
  storeStore.closeModal();
};
</script>

<template>
  <Dialog
    :open="storeStore.modalType === 'delete'"
    @update:open="val => { if (!val) storeStore.closeModal() }"
  >
    <DialogContent>
      <form @submit="handleDelete" class="space-y-6">
        <DialogHeader>
          <DialogTitle>Are you sure you want to delete this store?</DialogTitle>
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
