<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { useCategory } from '@/stores/categories'

// Components
import InputError from '@/components/InputError.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const categoryStore = useCategory()

const form = useForm({
  name: '',
  description: '',
})

const addCategory = (e: Event) => {
  e.preventDefault()

  form.post(route('categories.store'), {
    preserveScroll: true,
    onSuccess: (page) => {
      if (page.props?.category) {
        categoryStore.categories.unshift(page.props.category)
      } else {
        categoryStore.fetchCategories()
      }
      categoryStore.closeModal()
    },
    onFinish: () => form.reset(),
  })
}
</script>

<template>
  <div class="space-y-6">
    <Dialog 
      :open="categoryStore.modalType === 'add'" 
      @update:open="val => { if (!val) categoryStore.closeModal() }"
    >
      <DialogContent>
        <form class="space-y-6" @submit="addCategory">
          <DialogHeader class="space-y-3">
            <DialogTitle>Add category</DialogTitle>
          </DialogHeader>

          <div class="grid gap-2">
            <Label for="name" class="sr-only">Name</Label>
            <Input id="name" type="text" v-model="form.name" placeholder="Name" />
            <InputError :message="form.errors.name" />
          </div>

          <div class="grid gap-2">
            <Label for="description" class="sr-only">Description</Label>
            <Textarea id="description" v-model="form.description" placeholder="Description" />
            <InputError :message="form.errors.description" />
          </div>

          <DialogFooter class="gap-2">
            <Button type="button" variant="secondary" @click="categoryStore.closeModal()">Cancel</Button>
            <Button type="submit" :disabled="form.processing">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
