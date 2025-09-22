<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/stores/stores";

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
import Textarea from "@/components/ui/textarea/Textarea.vue";

const storeStore = useStore();

// ✅ Use computed: either prop or from store
const props = defineProps<{
  store?: { id: number; name: string; description?: string } | null;
}>();

const selectedStore = computed(() => props.store ?? storeStore.selectedStore);

const closeModal = () => {
  storeStore.closeModal();
  storeStore.selectedStore = null;
};
</script>

<template>
  <Dialog
    :open="storeStore.modalType === 'view'"
    @update:open="val => { if (!val) closeModal() }"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Viewing Store</DialogTitle>
        <DialogDescription>
          Details of {{ selectedStore?.name ?? "the selected store" }}.
        </DialogDescription>
      </DialogHeader>

      <div v-if="selectedStore" class="space-y-4">
        <div>
          <Label>Name</Label>
          <Input :model-value="selectedStore.name" disabled />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea :model-value="selectedStore.description" disabled />
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" @click="closeModal">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
