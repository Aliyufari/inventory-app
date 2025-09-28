<script setup lang="ts">
import { computed, onMounted } from "vue"
import { Head, useForm, usePage } from "@inertiajs/vue3"
import AppLayout from "@/layouts/AppLayout.vue"
import UsersLayout from "@/layouts/users/Layout.vue"
import { type BreadcrumbItem, type SharedData, type User } from "@/types"
import ComponentCard from "@/components/ui/card/ComponentCard.vue"
import UsersTable from "@/components/ui/table/UsersTable.vue"
import AddUser from "@/pages/users/AddUser.vue"
import EditUser from "@/pages/users/EditUser.vue"
import ViewUser from "@/pages/users/ViewUser.vue"
import DeleteUser from "@/pages/users/DeleteUser.vue"
import { Button } from "@/components/ui/button"
import { useUser } from "@/stores/users"
import { UserPlus } from "lucide-vue-next"
import Pagination from "@/pages/components/Pagination.vue"
import SearchInput from "@/pages/components/SeachInput.vue"

interface Props {
  mustVerifyEmail: boolean
  status?: string
  users?: unknown[]
}

defineProps<Props>()

const breadcrumbs: BreadcrumbItem[] = [{ title: "Manage Users", href: "/users" }]

const page = usePage<SharedData>()
const authUser = page.props.auth.user as User

const form = useForm({
  name: authUser.name,
  email: authUser.email,
})

const usersStore = useUser()

const users = computed(() => usersStore.users)

const submit = () => {
  form.patch(route("profile.update"), { preserveScroll: true })
}

onMounted(() => {
  if (!usersStore.users.length) {
    usersStore.fetchUsers()
  }
})

const handleSearch = () => {
  usersStore.fetchUsers(1) 
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Users" />

    <UsersLayout>
      <template #button>
        <Button @click="usersStore.openModal('add')">
          <UserPlus class="mr-2" /> Add User
        </Button>
      </template>

      <div class="space-y-5 sm:space-y-6">
        <ComponentCard>
          <!-- 🔍 Search input above table -->
          <div class="mb-4">
            <SearchInput
              v-model="usersStore.search"
              placeholder="Search user..."
              @search="handleSearch"
            />
          </div>

          <!-- Users Table -->
          <UsersTable
            :data="users"
            @edit="usersStore.openModal('edit', $event)"
            @view="usersStore.openModal('view', $event)"
            @delete="usersStore.openModal('delete', $event)"
          />

          <!-- Pagination -->
          <Pagination
            v-if="usersStore.pagination"
            :links="usersStore.pagination.links"
            :meta="usersStore.pagination.meta"
            :onPageChange="page => usersStore.fetchUsers(page)"
          />
        </ComponentCard>
      </div>

      <!-- Modals -->
      <AddUser
        v-if="usersStore.modalType === 'add'"
        @saved="usersStore.fetchUsers()"
      />
      <EditUser
        v-if="usersStore.modalType === 'edit'"
        :user="usersStore.selectedUser"
        @updated="usersStore.fetchUsers()"
      />
      <ViewUser
        v-if="usersStore.modalType === 'view'"
        :user="usersStore.selectedUser"
      />
      <DeleteUser
        v-if="usersStore.modalType === 'delete'"
        :user="usersStore.selectedUser"
        @deleted="usersStore.fetchUsers()"
      />
    </UsersLayout>
  </AppLayout>
</template>
