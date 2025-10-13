<script setup lang="ts">
import axios from 'axios'
import { useForm } from '@inertiajs/vue3'
import { onMounted, ref, watch } from 'vue'
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
import { Role, Store, User } from '@/types'
import MultiSelect from '@/components/ui/multiselect/MultiSelect.vue'

const usersStore = useUser()
const passwordInput = ref<HTMLInputElement | null>(null)
const roles = ref<{ label: string; value: string }[]>([])
const stores = ref<{ label: string; value: string }[]>([])

interface Props {
  user?: User | unknown
}

const props = defineProps<Props>()

// Form
const form = useForm({
  name: '',
  email: '',
  gender: '',
  status: '',
  password: '',
  role_id: '',
  store_ids: [] as string[],
})

// Sync props.user to form
watch(
  () => props.user,
  (user) => {
    if (user) {
      form.name = user.name
      form.email = user.email
      form.gender = user.gender
      form.status = user.status
      form.role_id = user.role?.id
      form.store_ids = user.stores?.map((s: Store) => s.id) ?? []
    }
  },
  { immediate: true }
)

// Fetch roles and stores
onMounted(async () => {
  try {
    const [roleRes, storeRes] = await Promise.all([
      axios.get(route('roles.index')),
      axios.get(route('stores.api')),
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
    console.error('Error fetching roles or stores:', error)
  }
})

// Update user
const updateUser = (e: Event) => {
  e.preventDefault()

  form.put(route('users.update', usersStore.selectedUser?.id), {
    preserveScroll: true,
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
    onError: () => passwordInput.value?.focus(),
    onFinish: () => form.reset(),
  })
}
</script>

<template>
  <div class="space-y-6">
    <Dialog
      :open="usersStore.modalType === 'edit'"
      @update:open="val => { if (!val) usersStore.closeModal() }"
    >
      <!-- ✅ Wider responsive modal -->
      <DialogContent class="!max-w-none w-[95vw] sm:w-[80vw] md:w-[60vw] lg:w-[50vw] xl:w-[45vw]">
        <form class="space-y-6" @submit="updateUser">
          <DialogHeader class="space-y-3">
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the details of the selected user.
            </DialogDescription>
          </DialogHeader>

          <!-- Email -->
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="form.email" placeholder="Email" />
            <InputError :message="form.errors.email" />
          </div>

          <!-- Role and Store(s) -->
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

          <!-- Password (optional reset/change) -->
          <!-- <div class="grid gap-2">
            <Label for="password">Password (optional)</Label>
            <Input
              id="password"
              type="password"
              v-model="form.password"
              placeholder="Enter new password"
              ref="passwordInput"
            />
            <InputError :message="form.errors.password" />
          </div> -->

          <!-- Actions -->
          <DialogFooter class="gap-2">
            <Button type="button" variant="secondary" @click="usersStore.closeModal()">Cancel</Button>
            <Button type="submit" :disabled="form.processing">Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
