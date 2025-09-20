<script setup lang="ts">
import { useForm } from '@inertiajs/vue3'
import { watch } from 'vue'
import { useUser } from '@/stores/users'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import InputError from '@/components/InputError.vue'

const usersStore = useUser()
const form = useForm({
  name: '',
  email: '',
  gender: '',
  status: '',
  password: '',
  role_id: '',
})

// When selectedUser changes, fill form
watch(
  () => usersStore.selectedUser,
  (user) => {
    if (user) {
      form.name = user.name
      form.email = user.email
      form.gender = user.gender
      form.status = user.status
      form.role_id = user.role.id
    }
  },
  { immediate: true }
)

const updateUser = (e: Event) => {
  e.preventDefault()
  form.put(route('users.update', usersStore.selectedUser.id), {
    onSuccess: () => usersStore.closeModal(),
  })
}
</script>

<template>
  <Dialog 
        :open="usersStore.modalType === 'edit'" 
        @update:open="val => { if (!val) usersStore.closeModal() }"
    >
    <DialogContent>
      <form @submit="updateUser" class="space-y-6">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>

        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input id="email" v-model="form.email" type="email" />
          <InputError :message="form.errors.email" />
        </div>

        <div class="grid gap-2">
          <Label for="status">Status</Label>
          <Select
            id="status"
            v-model="form.status"
            :options="[
              { label: 'Active', value: 'Active' },
              { label: 'Inactive', value: 'Inactive' },
            ]"
          />
        </div>

        <div class="flex gap-2 justify-end">
          <Button type="button" variant="secondary" @click="usersStore.closeModal">
            Cancel
          </Button>
          <Button type="submit" :disabled="form.processing">Update</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
