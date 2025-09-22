<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { watch } from 'vue'
import { useStore } from '@/stores/stores'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import InputError from '@/components/InputError.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'

const storeStore = useStore()

const form = useForm({
  name: '',
  description: '',
})

// ✅ Populate form when selectedStore changes
watch(
  () => storeStore.selectedStore,
  (store) => {
    if (store) {
      form.name = store.name
      form.description = store.description ?? ''
    }
  },
  { immediate: true }
)

const updateStore = (e: Event) => {
  e.preventDefault()

  form.put(route('stores.update', storeStore.selectedStore?.id), {
    onSuccess: (page) => {
      // ✅ If backend sends updated store in props, update directly
      if (page.props?.store) {
        storeStore.updateStore(page.props.store)
      } else {
        // fallback: refetch list
        storeStore.fetchStores()
      }

      storeStore.closeModal()
    },
    onFinish: () => form.reset(),
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

        <!-- Name -->
        <div class="grid gap-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="form.name" type="text" placeholder="Name" />
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
          <Button type="button" variant="secondary" @click="storeStore.closeModal()">
            Cancel
          </Button>
          <Button type="submit" :disabled="form.processing">Update</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
