<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted, watch } from 'vue'
import { useUser } from '@/stores/users'

// Components
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
import MultiSelect from '@/components/ui/multiselect/MultiSelect.vue'
import type { Role, Store, User } from '@/types'

const usersStore = useUser()

const roles = ref<{ label: string; value: string }[]>([])
const stores = ref<{ label: string; value: string }[]>([])

interface Props {
  user?: User | unknown
}

const props = defineProps<Props>()

const form = ref({
  name: '',
  email: '',
  gender: '',
  status: '',
  role_id: '',
  store_ids: [] as string[],
})

// Sync props.user to form (read-only)
watch(
  () => props.user,
  (user) => {
    if (user) {
      form.value.name = user.name
      form.value.email = user.email
      form.value.gender = user.gender
      form.value.status = user.status
      form.value.role_id = user.role?.id
      form.value.store_ids = user.stores?.map((s: Store) => s.id) ?? []
    }
  },
  { immediate: true }
)

// Fetch roles and stores (for label display)
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
</script>

<template>
  <div class="space-y-6">
    <Dialog
      :open="usersStore.modalType === 'view'"
      @update:open="val => { if (!val) usersStore.closeModal() }"
    >
      <!-- ✅ Same responsive width as Edit -->
      <DialogContent class="!max-w-none w-[95vw] sm:w-[80vw] md:w-[60vw] lg:w-[50vw] xl:w-[45vw]">
        <form class="space-y-6">
          <DialogHeader class="space-y-3">
            <DialogTitle>View User</DialogTitle>
            <DialogDescription>
              View the details of the selected user.
            </DialogDescription>
          </DialogHeader>

          <!-- Name -->
          <div class="grid gap-2">
            <Label for="name">Name</Label>
            <Input id="name" type="text" v-model="form.name" disabled />
          </div>

          <!-- Email -->
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="form.email" disabled />
          </div>

          <!-- Role and Store(s) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="role">Role</Label>
              <Select
                id="role"
                v-model="form.role_id"
                :options="roles"
                disabled
              />
            </div>

            <div class="grid gap-2">
              <Label for="store_ids">Store(s)</Label>
              <MultiSelect
                id="store_ids"
                v-model="form.store_ids"
                :options="stores"
                disabled
              />
            </div>
          </div>

          <!-- Gender -->
          <div class="grid gap-2">
            <Label for="gender">Gender</Label>
            <Select
              id="gender"
              v-model="form.gender"
              :options="[
                { label: 'Female', value: 'female' },
                { label: 'Male', value: 'male' }
              ]"
              disabled
            />
          </div>

          <!-- Status -->
          <div class="grid gap-2">
            <Label for="status">Status</Label>
            <Select
              id="status"
              v-model="form.status"
              :options="[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
              ]"
              disabled
            />
          </div>

          <!-- Actions -->
          <DialogFooter class="gap-2">
            <Button type="button" variant="secondary" @click="usersStore.closeModal()">
              Close
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>
