<script setup lang="ts">
import axios from 'axios';
import { useForm } from '@inertiajs/vue3'
import { onMounted, ref, watch } from 'vue'
import { useUser } from '@/stores/users'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import InputError from '@/components/InputError.vue'
import { Role, User } from '@/types'

const roles = ref<{ label: string; value: string }[]>([])
interface Props {
  user?: User | unknown;
}

const props = defineProps<Props>();

const usersStore = useUser()
const form = useForm({
  name: '',
  email: '',
  gender: '',
  status: '',
  password: '',
  role_id: '',
})

watch(() => props.user, (user) => {
    if (user) {
      form.name = user.name
      form.email = user.email
      form.gender = user.gender
      form.status = user.status
      form.role_id = user.role?.id
    }
  },
  { immediate: true }
)

onMounted(async () => {
  try {
    const { data } = await axios.get(route('roles.index'))
    roles.value = data.roles.map((role: Role) => ({
      label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
      value: role.id,
    }))
  } catch (error) {
    console.error('Error fetching roles:', error)
  }
})

// Update user
const updateUser = (e: Event) => {
  e.preventDefault()
  form.put(route('users.update', usersStore.selectedUser?.id), {
    onSuccess: (page) => {
      if (page.props?.user) {
        const index = usersStore.users.findIndex(u => u.id === page.props.user.id)
        if (index !== -1) {
          usersStore.users[index] = page.props.user
        } else {
          usersStore.users.unshift(page.props.user)
        }
      } else {
        usersStore.fetchUsers()
      }
      usersStore.closeModal()
    },
    onFinish: () => form.reset(),
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

        <!-- Email -->
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input id="email" v-model="form.email" type="email" />
          <InputError :message="form.errors.email" />
        </div>

        <!-- Role -->
        <div class="grid gap-2">
          <Label for="role">Role</Label>
          <Select
            id="role"
            v-model="form.role_id"
            placeholder="Select role"
            :options="roles"
          />
          <InputError :message="form.errors.role_id" />
        </div>

        <!-- Gender -->
        <div class="grid gap-2">
          <Label for="gender">Gender</Label>
          <Select
            id="gender"
            placeholder="Select gender"
            v-model="form.gender"
            :options="[
              { label: 'Female', value: 'female' },
              { label: 'Male', value: 'male' }
            ]"
          />
          <InputError :message="form.errors.gender" />
        </div>

        <!-- Status -->
        <div class="grid gap-2">
          <Label for="status">Status</Label>
          <Select
            id="status"
            placeholder="Select status"
            v-model="form.status"
            :options="[
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' }
            ]"
          />
          <InputError :message="form.errors.status" />
        </div>

        <!-- Actions -->
        <div class="flex gap-2 justify-end">
          <Button type="button" variant="secondary" @click="usersStore.closeModal()">
            Cancel
          </Button>
          <Button type="submit" :disabled="form.processing">Update</Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>