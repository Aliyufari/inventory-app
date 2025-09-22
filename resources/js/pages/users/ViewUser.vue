<script setup lang="ts">
import { computed } from "vue";
import { useUser } from "@/stores/users";
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
import type { User } from "@/types";

const usersStore = useUser();

const props = defineProps<{
  user?: User | null;
}>();

// ✅ Use computed: either prop (from parent) or fallback to store
const selectedUser = computed(() => props.user ?? usersStore.selectedUser);

const closeModal = () => {
  usersStore.closeModal();
  usersStore.selectedUser = null;
};

// ✅ helper to capitalize safely
const capitalize = (val?: string | null) => {
  if (!val) return "";
  return val.charAt(0).toUpperCase() + val.slice(1);
};
</script>

<template>
  <Dialog
    :open="usersStore.modalType === 'view'"
    @update:open="val => { if (!val) closeModal() }"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Viewing User</DialogTitle>
        <DialogDescription>
          Details of {{ selectedUser?.name ?? "the selected user" }}.
        </DialogDescription>
      </DialogHeader>

      <div v-if="selectedUser" class="space-y-4">
        <div>
          <Label>Name</Label>
          <Input :model-value="selectedUser.name" disabled />
        </div>

        <div>
          <Label>Email</Label>
          <Input :model-value="selectedUser.email" disabled />
        </div>

        <div>
          <Label>Role</Label>
          <Input :model-value="capitalize(selectedUser.role?.name)" disabled />
        </div>

        <div>
          <Label>Gender</Label>
          <Input :model-value="capitalize(selectedUser.gender)" disabled />
        </div>

        <div>
          <Label>Status</Label>
          <Input :model-value="capitalize(selectedUser.status)" disabled />
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" @click="closeModal">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
