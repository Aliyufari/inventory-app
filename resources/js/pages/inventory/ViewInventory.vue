<script setup lang="ts">
import { computed } from "vue";
import { useInvoice } from "@/stores/invoice";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const inventoryStore = useInvoice();

const props = defineProps<{
  inventory?: {
    id: number;
    customer: string;
    date: string;
    discount?: number;
    products: { id: number; name: string; price: number; quantity: number }[];
  } | null;
}>();

const total = computed(() => {
  if (!props.inventory) return 0;
  const subtotal = props.inventory.products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
  return subtotal - (props.inventory.discount ?? 0);
});

const closeModal = () => {
  inventoryStore.closeModal();
  inventoryStore.selectedInventory = null;
};
</script>

<template>
  <Dialog
    :open="inventoryStore.modalType === 'view'"
    @update:open="val => { if (!val) closeModal() }"
  >
    <DialogContent class="sm:max-w-2xl max-w-[calc(100%-2rem)]">
      <div class="space-y-6">
        <DialogHeader>
          <DialogTitle>Inventory Details</DialogTitle>
        </DialogHeader>

        <div class="grid gap-2">
          <Label>Customer</Label>
          <div>{{ props.inventory?.customer }}</div>
        </div>

        <div class="grid gap-2">
          <Label>Date</Label>
          <div>{{ props.inventory?.date }}</div>
        </div>

        <div class="space-y-2">
          <Label>Products</Label>
          <div class="space-y-1">
            <div
              v-for="p in props.inventory?.products"
              :key="p.id"
              class="flex justify-between text-sm border-b pb-1"
            >
              <span>{{ p.name }} (x{{ p.quantity }})</span>
              <span>{{ p.price * p.quantity }}</span>
            </div>
          </div>
        </div>

        <div class="grid gap-2">
          <Label>Discount</Label>
          <div>{{ props.inventory?.discount ?? 0 }}</div>
        </div>

        <div class="text-lg font-bold">Total: {{ total }}</div>

        <DialogFooter>
          <Button variant="secondary" @click="closeModal">Close</Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
