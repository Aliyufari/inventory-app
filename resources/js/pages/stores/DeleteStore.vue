<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";

// Components
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

const passwordInput = ref<HTMLInputElement | null>(null);
const storeStore = useStore(); // renamed for clarity
const loading = ref(false);
const error = ref<string | null>(null);

const deleteStore = async (e: Event) => {
  e.preventDefault();
  loading.value = true;
  error.value = null;

  try {
    await axios.delete(route("stores.delete", storeStore.selectedStore?.id));
    storeStore.closeModal();
    // optionally refresh list:
    storeStore.fetchStores?.();
  } catch (err: any) {
    console.error("Error deleting store:", err);
    error.value = "Failed to delete store.";
    passwordInput.value?.focus();
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
      <form @submit="deleteStore" class="space-y-6">
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
