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
import { Role, Store } from '@/types'
import MultiSelect from '@/components/ui/multiselect/MultiSelect.vue'

const usersStore = useUser()
const passwordInput = ref<HTMLInputElement | null>(null);
const roles = ref<{ label: string; value: string }[]>([]);
const stores = ref<{ label: string; value: string }[]>([]);

const form = useForm({
  email: '',
  role_id: '',
  store_ids: [] as string[],
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
    const [roleRes, storeRes] = await Promise.all([
      axios.get(route("roles.index")),
      axios.get(route("stores.api")),
    ])

    roles.value = roleRes.data.roles.map((role: Role) => ({
      label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
      value: role.id,
    }))

    stores.value = storeRes.data.stores.map((store: Store) => ({
      label: store.name.charAt(0).toUpperCase() + store.name.slice(1),
      value: store.id,
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
      <DialogContent class="!max-w-none w-[95vw] sm:w-[80vw] md:w-[60vw] lg:w-[50vw] xl:w-[45vw]">
        <form class="space-y-6" @submit="addUser">
          <DialogHeader class="space-y-3">
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>
              User will be inactive by default, until activated by admin.
            </DialogDescription>
          </DialogHeader>

          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="form.email" placeholder="Email" />
            <InputError :message="form.errors.email" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div class="grid gap-2">
              <Label for="store_ids">Store(s)</Label>
              <MultiSelect
                id="store_ids"
                placeholder="Select store(s)"
                v-model="form.store_ids"
                :options="stores"
              />
              <InputError :message="form.errors.store_ids" />
            </div>
          </div>

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

          <div class="grid gap-2">
            <Label for="password">Password</Label>
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