<script setup lang="ts">
import axios from 'axios'
import { useForm } from '@inertiajs/vue3'
import { onMounted, ref } from 'vue'
import { useUser } from '@/stores/users'

// Components
import InputError from '@/components/InputError.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Role } from '@/types'

const usersStore = useUser()
const passwordInput = ref<HTMLInputElement | null>(null);
const roles = ref<{ label: string; value: string }[]>([]);

const form = useForm({
  email: '',
  role_id: '',
  gender: '',
  password: '',
})

const addUser = (e: Event) => {
  e.preventDefault()

  form.post(route('users.store'), {
    preserveScroll: true,
    onSuccess: (page) => {
      if (page.props?.user) {
        usersStore.users.unshift(page.props.user) 
      } else {
        usersStore.fetchUsers()
      }

      usersStore.closeModal()
    },
    onError: () => passwordInput.value?.focus(),
    onFinish: () => form.reset(),
  })
}

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
</script>

<template>
  <div class="space-y-6">
    <Dialog 
      :open="usersStore.modalType === 'add'" 
      @update:open="val => { if (!val) usersStore.closeModal() }"
    >
      <DialogContent>
        <form class="space-y-6" @submit="addUser">
          <DialogHeader class="space-y-3">
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              User will be inactive by default, until activated by admin.
            </DialogDescription>
          </DialogHeader>

          <div class="grid gap-2">
            <Label for="email" class="sr-only">Email</Label>
            <Input id="email" type="email" v-model="form.email" placeholder="Email" />
            <InputError :message="form.errors.email" />
          </div>

          <div class="grid gap-2">
            <Label for="role" class="sr-only">Role</Label>
            <Select
              id="role"
              v-model="form.role_id"
              placeholder="Select role"
              :options="roles"
            />
            <InputError :message="form.errors.role_id" />
          </div>

          <div class="grid gap-2">
            <Label for="gender" class="sr-only">Gender</Label>
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

          <div class="grid gap-2">
            <Label for="password" class="sr-only">Password</Label>
            <Input
              id="password"
              type="password"
              v-model="form.password"
              placeholder="Password"
              ref="passwordInput"
            />
            <InputError :message="form.errors.password" />
          </div>

          <DialogFooter class="gap-2">
            <Button type="button" variant="secondary" @click="usersStore.closeModal()">Cancel</Button>
            <Button type="submit" :disabled="form.processing">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>