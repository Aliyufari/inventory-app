<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { ref } from 'vue'
import { useStore } from '@/stores/stores'

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

const storeStore = useStore()
const passwordInput = ref<HTMLInputElement | null>(null)

const form = useForm({
  name: '',
  description: '',
})

const addStore = (e: Event) => {
  e.preventDefault()

  form.post(route('stores.store'), {
    preserveScroll: true,
    onSuccess: (page) => {
      if (page.props?.store) {
        storeStore.stores.unshift(page.props.store)
      } else {
        storeStore.fetchStores()
      }
      storeStore.closeModal()
    },
    onFinish: () => form.reset(),
  })
}
</script>

<template>
  <div class="space-y-6">
    <Dialog 
      :open="storeStore.modalType === 'add'" 
      @update:open="val => { if (!val) storeStore.closeModal() }"
    >
      <DialogContent>
        <form class="space-y-6" @submit="addStore">
          <DialogHeader class="space-y-3">
            <DialogTitle>Add store</DialogTitle>
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
            <Button type="button" variant="secondary" @click="storeStore.closeModal()">Cancel</Button>
            <Button type="submit" :disabled="form.processing">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
