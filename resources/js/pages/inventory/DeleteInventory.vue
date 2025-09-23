<script setup lang="ts">
import { useInventory } from "@/stores/inventory";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const inventoryStore = useInventory();

const props = defineProps<{
  inventory?: { id: number; customer: string } | null;
}>();

const closeModal = () => {
  inventoryStore.closeModal();
  inventoryStore.selectedInventory = null;
};

const confirmDelete = () => {
  if (props.inventory) {
    inventoryStore.deleteInventory(props.inventory.id);
  }
  closeModal();
};
</script>

<template>
  <Dialog
    :open="inventoryStore.modalType === 'delete'"
    @update:open="val => { if (!val) closeModal() }"
  >
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Delete Inventory</DialogTitle>
      </DialogHeader>

      <p>
        Are you sure you want to delete inventory for
        <strong>{{ props.inventory?.customer }}</strong>?
      </p>

      <DialogFooter class="gap-2">
        <Button variant="secondary" @click="closeModal">Cancel</Button>
        <Button variant="destructive" @click="confirmDelete">Delete</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
