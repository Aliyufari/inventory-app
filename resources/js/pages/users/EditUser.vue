<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { useUser } from '@/stores/users'
import { toast } from 'vue-sonner'

// Components
import Modal from '@/components/AppModal.vue'
import InputError from '@/components/InputError.vue'
import MultiSelect from '@/components/ui/multiselect/MultiSelect.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Select from '@/components/ui/select/Select.vue'
import { LoaderCircle } from 'lucide-vue-next'

// Define Props
const props = defineProps<{
  user: any 
}>()

const usersStore = useUser()
const emit = defineEmits(['updated'])

const roles = computed(() => usersStore.allRoles)
const stores = computed(() => usersStore.allStores)

const form = useForm({
  _method: 'PUT',
  email: '',
  role_id: '',
  store_ids: [] as string[],
  gender: '',
  status: true,
})

const showEditModal = computed({
  get: () => usersStore.modalType === 'edit',
  set: (val) => {
    if (!val) usersStore.closeModal()
  },
})

const fillForm = () => {
  if (props.user) {
    form.email = props.user.email || ''
    form.role_id = props.user.role.id?.toString() || ''
    form.gender = props.user.gender || ''
    form.status = props.user.status === 1 || props.user.status === true
    form.store_ids = (props.user.stores || []).map(c => String(c.id))
  }
}

onMounted(fillForm)
watch(() => props.user, fillForm, { deep: true })

const update = async () => {
  if (form.processing) return

  try {
    await usersStore.updateUser(props.user.id, form)
    emit('updated')
  } catch (error) {
    console.error('Update failed:', error)
  }
}
</script>

<template>
  <Modal v-model="showEditModal" title="Edit User" width="500px">
    <form class="space-y-5" @submit.prevent="update">
      <div class="grid gap-2">
        <Label for="edit-email">Email</Label>
        <Input id="edit-email" type="email" v-model="form.email" placeholder="Enter email" />
        <InputError :message="form.errors.email" />
      </div>

      <div class="grid gap-2">
        <Label for="edit-gender">Gender</Label>
        <Select 
          id="edit-gender" 
          v-model="form.gender" 
          :options="[
            { label: 'Female', value: 'female' },
            { label: 'Male', value: 'male' }
          ]" 
          placeholder="Select gender"
        />
        <InputError :message="form.errors.gender" />
      </div>

      <div class="grid gap-2">
        <Label for="edit-role">Role</Label>
        <Select id="edit-role" v-model="form.role_id" :options="roles" placeholder="Select role" />
        <InputError :message="form.errors.role_id" />
      </div>

      <div class="grid gap-2">
        <Label for="edit-stores">Assigned Stores</Label>
        <MultiSelect v-model="form.store_ids" :options="stores" placeholder="Select stores" />
        <InputError :message="form.errors.store_ids" />
      </div>

      <div class="flex gap-4 items-center">
        <label class="inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="form.status" class="sr-only peer" />
          <div class="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 relative transition">
            <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition peer-checked:translate-x-5"></div>
          </div>
          <span class="ml-3 text-sm font-medium text-gray-700 select-none">Active Account</span>
        </label>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-3">
        <Button @click="update" :disabled="form.processing">
          <LoaderCircle v-if="form.processing" class="mr-2 h-4 w-4 animate-spin" />
          Upadate
        </Button>
      </div>
    </template>
  </Modal>
</template>