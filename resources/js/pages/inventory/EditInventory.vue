<script setup lang="ts">
import { computed, ref } from "vue";
import { useInventory } from "@/stores/inventory";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/select/Select.vue";
import { X, Plus } from "lucide-vue-next";

const inventoryStore = useInventory();

const props = defineProps<{
  inventory?: {
    id: number;
    customer: string;
    date: string;
    discount?: number;
    products: { id: number; name: string; price: number; quantity: number }[];
  } | null;
}>();

// Work on a local copy to edit safely
const editedInventory = ref(
  props.inventory
    ? { ...props.inventory, products: [...props.inventory.products] }
    : { customer: "", date: "", discount: 0, products: [] }
);

const addRow = () => {
  editedInventory.value.products.push({ id: Date.now(), name: "", price: 0, quantity: 1 });
};
const removeRow = (index: number) => {
  editedInventory.value.products.splice(index, 1);
};

const total = computed(() => {
  const subtotal = editedInventory.value.products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );
  return subtotal - (editedInventory.value.discount ?? 0);
});

const closeModal = () => {
  inventoryStore.closeModal();
  inventoryStore.selectedInventory = null;
};

const save = () => {
  inventoryStore.updateInventory(editedInventory.value);
  closeModal();
};
</script>

<template>
  <Dialog
    :open="inventoryStore.modalType === 'edit'"
    @update:open="val => { if (!val) closeModal() }"
  >
    <DialogContent class="sm:max-w-3xl max-w-[calc(100%-2rem)]">
      <div class="space-y-6">
        <DialogHeader>
          <DialogTitle>Edit Inventory</DialogTitle>
        </DialogHeader>

        <!-- Customer -->
        <div class="grid gap-2">
          <Label>Customer</Label>
          <Input v-model="editedInventory.customer" />
        </div>

        <!-- Date -->
        <div class="grid gap-2">
          <Label>Date</Label>
          <Input type="date" v-model="editedInventory.date" />
        </div>

        <!-- Products -->
        <div class="space-y-4">
          <div
            v-for="(product, index) in editedInventory.products"
            :key="product.id"
            class="grid grid-cols-5 gap-2 items-center"
          >
            <Input v-model="product.name" placeholder="Product name" />
            <Input type="number" v-model.number="product.price" placeholder="Price" />
            <Input type="number" v-model.number="product.quantity" placeholder="Qty" />
            <div class="text-sm font-medium">
              {{ product.price * product.quantity }}
            </div>
            <Button variant="destructive" @click="removeRow(index)">
              <X class="w-4 h-4" />
            </Button>
          </div>

          <Button type="button" variant="secondary" @click="addRow">
            <Plus class="w-4 h-4" /> Add Product
          </Button>
        </div>

        <!-- Discount -->
        <div class="grid gap-2">
          <Label>Discount</Label>
          <Input type="number" v-model.number="editedInventory.discount" />
        </div>

        <!-- Total -->
        <div class="text-lg font-bold">
          Total: {{ total }}
        </div>

        <DialogFooter class="gap-2">
          <Button variant="secondary" @click="closeModal">Cancel</Button>
          <Button type="button" @click="save">Save Changes</Button>
        </DialogFooter>
      </div>
    </DialogContent>
  </Dialog>
</template>
