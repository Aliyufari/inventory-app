<script setup lang="ts">
import { ref } from 'vue'
import { useUser } from '@/stores/users'
import { toast } from 'vue-sonner'
import Prompt from '@/components/ui/Prompt.vue'

const userStore = useUser()
const emit = defineEmits<{
  (e: 'deleted'): void
}>()

const loading = ref(false)
const showPrompt = ref(true)

const handleDelete = async () => {
  const user = userStore.selectedUser
  if (!user?.id) {
    toast.error('No user selected')
    return
  }

  loading.value = true
  try {
    await userStore.deleteUser(user.id)
    toast.success('User deleted successfully')
    emit('deleted')
    showPrompt.value = false
  } catch (err: any) {
    console.error('Delete failed:', err)
    toast.error('Failed to delete user')
  } finally {
    loading.value = false
  }
}

const closePrompt = () => {
  showPrompt.value = false
  userStore.closeModal()
}
</script>

<template>
  <Prompt
    v-model="showPrompt"
    title="Delete User"
    :message="`Are you sure you want to delete '${userStore.selectedUser?.name}'?`"
    confirmText="Delete"
    cancelText="Cancel"
    danger
    :loading="loading"
    @confirm="handleDelete"
    @cancel="closePrompt"
  />
</template>
