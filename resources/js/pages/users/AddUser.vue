<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { useUser } from '@/stores/users'
import { toast } from 'vue-sonner'
import Modal from '@/components/AppModal.vue'
import InputError from '@/components/InputError.vue'
import MultiSelect from '@/components/ui/multiselect/MultiSelect.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Select from '@/components/ui/select/Select.vue'
import { LoaderCircle } from 'lucide-vue-next'

const usersStore = useUser()
const emit = defineEmits(['saved'])

const roles = computed(() => usersStore.allRoles)
const stores = computed(() => usersStore.allStores)

const showAddModal = computed({
  get: () => usersStore.modalType === 'add',
  set: (val) => {
    if (!val) usersStore.closeModal()
  },
})

const form = useForm({
  email: '',
  gender: '',
  role_id: '',
  store_ids: [] as string[],
})

const submit = async () => {
  try {
    await usersStore.createUser(form)
    form.reset()
    emit('saved')
  } catch (error) {
    console.error('Submission failed', error)
  }
}
</script>

<template>
  <Modal v-model="showAddModal" title="Add User" width="500px">
    <form class="space-y-5" @submit.prevent="submit">
      <div class="grid gap-2">
        <Label for="email">Email</Label>
        <Input id="email" type="email" v-model="form.email" placeholder="Enter email" />
        <InputError :message="form.errors.email" />
      </div>

      <div class="grid gap-2">
        <Label for="gender">Gender</Label>
        <Select 
          id="gender" 
          v-model="form.gender" 
          :options="[{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }]" 
          placeholder="Select gender"
        />
        <InputError :message="form.errors.gender" />
      </div>

      <div class="grid gap-2">
        <Label for="store_ids">Stores</Label>
        <MultiSelect v-model="form.store_ids" :options="stores" placeholder="Select stores" />
        <InputError :message="form.errors.store_ids" />
      </div>
      
      <div class="grid gap-2">
        <Label for="role">Role</Label>
        <Select id="role" v-model="form.role_id" :options="roles" placeholder="Select role" />
        <InputError :message="form.errors.role_id" />
      </div>
    </form>

    <template #footer>
      <Button @click="submit" :disabled="form.processing">
        <LoaderCircle v-if="form.processing" class="mr-2 h-4 w-4 animate-spin" />
        Submit
      </Button>
    </template>
  </Modal>
</template>