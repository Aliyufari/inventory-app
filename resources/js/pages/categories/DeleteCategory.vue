<script setup lang="ts">
import { ref } from "vue"
import axios from "axios"

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

import { useCategory } from "@/stores/categories"

const categoryStore = useCategory()
const loading = ref(false)
const error = ref<string | null>(null)

const deleteCategory = async (e: Event) => {
  e.preventDefault()
  loading.value = true
  error.value = null

  try {
    await axios.delete(route("categories.delete", categoryStore.selectedCategory?.id))
    categoryStore.closeModal()
    // 🔄 Refresh categories if available
    categoryStore.fetchCategories?.()
  } catch (err: any) {
    console.error("Error deleting category:", err)
    error.value = "Failed to delete category."
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  error.value = null
  categoryStore.closeModal()
}
</script>

<template>
  <Dialog
    :open="categoryStore.modalType === 'delete'"
    @update:open="val => { if (!val) categoryStore.closeModal() }"
  >
    <DialogContent>
      <form @submit="deleteCategory" class="space-y-6">
        <DialogHeader>
          <DialogTitle>
            Are you sure you want to delete this category?
          </DialogTitle>
          <DialogDescription>
            This action cannot be reverted and all products under this category
            will also be deleted.
          </DialogDescription>
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
