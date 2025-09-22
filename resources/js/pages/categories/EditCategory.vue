<script setup lang="ts">
import { useForm } from "@inertiajs/vue3"
import { watch } from "vue"
import { useCategory } from "@/stores/categories"

// Components
import InputError from "@/components/InputError.vue"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Textarea from "@/components/ui/textarea/Textarea.vue"

const categoryStore = useCategory()

const form = useForm({
  name: "",
  description: "",
})

// ✅ Populate form when selectedCategory changes
watch(
  () => categoryStore.selectedCategory,
  (category) => {
    if (category) {
      form.name = category.name
      form.description = category.description ?? ""
    }
  },
  { immediate: true }
)

const updateCategory = (e: Event) => {
  e.preventDefault()

  form.put(route("categories.update", categoryStore.selectedCategory?.id), {
    onSuccess: (page) => {
      // ✅ If backend sends updated category in props, update directly
      if (page.props?.category) {
        categoryStore.updateCategory(page.props.category)
      } else {
        // fallback: refetch list
        categoryStore.fetchCategories()
      }

      categoryStore.closeModal()
    },
    onFinish: () => form.reset(),
  })
}
</script>

<template>
  <Dialog
    :open="categoryStore.modalType === 'edit'"
    @update:open="val => { if (!val) categoryStore.closeModal() }"
  >
    <DialogContent>
      <form @submit="updateCategory" class="space-y-6">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>

        <!-- Name -->
        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input
            id="name"
            v-model="form.name"
            type="text"
            placeholder="Name"
          />
          <InputError :message="form.errors.name" />
        </div>

        <!-- Description -->
        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="form.description"
            placeholder="Description"
          />
          <InputError :message="form.errors.description" />
        </div>

        <!-- Actions -->
        <div class="flex gap-2 justify-end">
          <Button
            type="button"
            variant="secondary"
            @click="categoryStore.closeModal()"
          >
            Cancel
          </Button>
          <Button type="submit" :disabled="form.processing">
            Update
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
