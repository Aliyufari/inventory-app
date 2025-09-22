<script setup lang="ts">
import { computed } from "vue"
import { useCategory } from "@/stores/categories"

// Components
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Textarea from "@/components/ui/textarea/Textarea.vue"

const categoryStore = useCategory()

// ✅ Accept optional category as prop
const props = defineProps<{
  category?: { id: number; name: string; description?: string } | null
}>()

// ✅ Use computed: either prop or from store
const selectedCategory = computed(() => props.category ?? categoryStore.selectedCategory)

const closeModal = () => {
  categoryStore.closeModal()
  categoryStore.selectedCategory = null
}
</script>

<template>
  <Dialog
    :open="categoryStore.modalType === 'view'"
    @update:open="val => { if (!val) closeModal() }"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Viewing Category</DialogTitle>
        <DialogDescription>
          Details of {{ selectedCategory?.name ?? "the selected category" }}.
        </DialogDescription>
      </DialogHeader>

      <div v-if="selectedCategory" class="space-y-4">
        <div>
          <Label>Name</Label>
          <Input :model-value="selectedCategory.name" disabled />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea :model-value="selectedCategory.description" disabled />
        </div>
      </div>

      <DialogFooter>
        <Button variant="secondary" @click="closeModal">Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
