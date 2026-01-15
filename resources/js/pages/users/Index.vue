<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { Head } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'
import UsersLayout from '@/layouts/users/Layout.vue'
import { type BreadcrumbItem } from '@/types'
import AddUser from '@/pages/users/AddUser.vue'
import EditUser from '@/pages/users/EditUser.vue'
import ViewUser from '@/pages/users/ViewUser.vue'
import DeleteUser from '@/pages/users/DeleteUser.vue'
import { Button } from '@/components/ui/button'
import { useUser } from '@/stores/users'
import { UserPlus } from 'lucide-vue-next'
import UsersTable from './UsersTable.vue'

const props = defineProps<{
  data: any
  roles: any
  stores: any
}>()

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Manage Users', href: '/users' },
]

const usersStore = useUser()

onMounted(() => {
  usersStore.setUsers(props.data, props.roles, props.stores)
})

watch(() => props.data, (newData) => {
  usersStore.setUsers(newData, props.roles, props.stores)
}, { deep: true })
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Users" />

    <UsersLayout>
      <template #button>
        <Button @click="usersStore.openAdd()">
          <UserPlus class="mr-2 h-4 w-4" />
          Add User
        </Button>
      </template>

      <div class="space-y-5 sm:space-y-6">
        <UsersTable />
      </div>

      <!-- MODALS -->
      <AddUser
        v-if="usersStore.modalType === 'add'"
        @saved="usersStore.closeModal"
      />

      <EditUser
        v-if="usersStore.modalType === 'edit'"
        :user="usersStore.selectedUser"
        @updated="usersStore.closeModal"
      />

      <ViewUser
        v-if="usersStore.modalType === 'view'"
        :user="usersStore.selectedUser"
        @close="usersStore.closeModal"
      />

      <DeleteUser
        v-if="usersStore.modalType === 'delete'"
        :user="usersStore.selectedUser"
        @deleted="usersStore.closeModal"
      />
    </UsersLayout>
  </AppLayout>
</template>
