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

const userStore = useUser();
const loading = ref(false);
const error = ref<string | null>(null);

const deleteUser = async (e: Event) => {
  e.preventDefault();
  loading.value = true;
  error.value = null;

  try {
    await axios.delete(route("users.delete", userStore.selectedUser?.id));

    // ✅ remove from store immediately
    if (userStore.selectedUser?.id) {
      userStore.removeUser(userStore.selectedUser.id);
    }

    // ✅ close modal
    userStore.closeModal();

    // ✅ refresh from server (optional, in case pagination changed)
    await userStore.fetchUsers();
  } catch (err: any) {
    console.error("Error deleting user:", err);
    error.value = "Failed to delete user.";
  } finally {
    loading.value = false;
  }
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
          <DialogTitle>Are you sure you want to delete this user?</DialogTitle>
          <DialogDescription>
            This action cannot be reverted.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter class="gap-2">
          <Button type="button" variant="secondary" @click="userStore.closeModal()">
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
