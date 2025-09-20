<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { watch } from 'vue'
import { useStore } from '@/stores/stores'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import InputError from '@/components/InputError.vue'

const storeStore = useStore()
const form = useForm({
  name: '',
  description: '',
})

// When selectedUser changes, fill form
watch(
  () => storeStore.selectedStore,
  (store) => {
    if (store) {
      form.name = store.name
      form.description = store.description
    }
  },
  { immediate: true }
)

const updateStore = (e: Event) => {
  e.preventDefault()
  form.put(route('users.update', storeStore.selectedStore?.id), {
    onSuccess: () => storeStore.closeModal(),
  })
}
</script>

<template>
  <Dialog 
        :open="storeStore.modalType === 'edit'" 
        @update:open="val => { if (!val) storeStore.closeModal() }"
    >
    <DialogContent>
      <form @submit="updateStore" class="space-y-6">
        <DialogHeader>
          <DialogTitle>Edit Store</DialogTitle>
        </DialogHeader>

        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="form.name" type="name" placeholder="Name" />
          <InputError :message="form.errors.name" />
        </div>

        <div class="grid gap-2">
            <Label for="role" class="sr-only">Description</Label>
            <Textarea v-model="form.description" value="" placeholder="Description" />
            <InputError :message="form.errors.description" />
        </div>

        <div class="flex gap-2 justify-end">
          <Button type="button" variant="secondary" @click="storeStore.closeModal">
            Cancel
          </Button>
          <Button type="submit" :disabled="form.processing">Update</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
