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

import { useUser } from "@/stores/users";

const userStore = useUser(); // renamed for clarity
const loading = ref(false);
const error = ref<string | null>(null);

const deleteUser = async (e: Event) => {
  e.preventDefault();
  loading.value = true;
  error.value = null;

  try {
    await axios.delete(route("users.delete", userStore.selectedUser?.id));
    userStore.closeModal();
    // optionally refresh list:
    userStore.fetchUsers?.();
  } catch (err: any) {
    console.error("Error deleting user:", err);
    error.value = "Failed to delete user.";
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  error.value = null;
  userStore.closeModal();
};
</script>

<template>
  <Dialog
    :open="userStore.modalType === 'delete'"
    @update:open="val => { if (!val) userStore.closeModal() }"
  >
    <DialogContent>
      <form @submit="deleteUser" class="space-y-6">
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