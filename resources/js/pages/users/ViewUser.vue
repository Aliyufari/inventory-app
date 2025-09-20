<script setup lang="ts">
import { computed } from "vue";
import { useUser } from "@/stores/users";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const usersStore = useUser();
const user = computed(() => usersStore.selectedUser);

const closeModal = () => {
  usersStore.closeModal();
};
</script>

<template>
  <Dialog
    :open="usersStore.modalType === 'view'"
    @update:open="val => { if (!val) usersStore.closeModal() }"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Viewing User</DialogTitle>
        <DialogDescription>Details of the selected user.</DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div>
          <Label>Email</Label>
          <Input :value="user?.email" disabled />
        </div>

        <div>
          <Label>Role</Label>
          <Input :value="user?.role?.name" disabled />
        </div>

        <div>
          <Label>Gender</Label>
          <Input :value="user?.gender" disabled />
        </div>

        <div>
          <Label>Status</Label>
          <Input :value="user?.status" disabled />
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" @click="closeModal">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
