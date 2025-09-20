<script setup lang="ts">
import { computed, onMounted } from "vue";
import { Head, useForm, usePage } from "@inertiajs/vue3";
import AppLayout from "@/layouts/AppLayout.vue";
import UsersLayout from "@/layouts/users/Layout.vue";
import { type BreadcrumbItem, type SharedData, type User } from "@/types";
import ComponentCard from "@/components/ui/card/ComponentCard.vue";
import UsersTable from "@/components/ui/table/UsersTable.vue";
import AddUser from "@/pages/users/AddUser.vue";
import EditUser from "@/pages/users/EditUser.vue";
import ViewUser from "@/pages/users/ViewUser.vue";
import DeleteUser from "@/pages/users/DeleteUser.vue";
import { Button } from "@/components/ui/button";
import Heading from "@/components/Heading.vue";
import { useUser } from "@/stores/users";
import { UserPlus } from "lucide-vue-next";

interface Props {
  mustVerifyEmail: boolean;
  status?: string;
  users?: unknown[];
}

defineProps<Props>();

const breadcrumbs: BreadcrumbItem[] = [{ title: "Manage users", href: "/users" }];

const page = usePage<SharedData>();
const user = page.props.auth.user as User;

const form = useForm({
  name: user.name,
  email: user.email,
});

const usersStore = useUser();
const users = computed(() => usersStore.users);

const submit = () => {
  form.patch(route("profile.update"), { preserveScroll: true });
};

onMounted(() => {
  if (!usersStore.users.length) {
    usersStore.fetchUsers();
  }
});
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Users" />

    <UsersLayout>
      <template #button>
        <Button @click="usersStore.openModal('add')"><UserPlus /> Add User</Button>
      </template>


      <div class="space-y-5 sm:space-y-6">
        <ComponentCard>
          <UsersTable :data="users">
            <template #view="{ user }">
              <ViewUser :user="user" />
            </template>

            <template #edit="{ user }">
              <EditUser :user="user" />
            </template>

            <template #default="{ user }">
              <DeleteUser :user="user" />
            </template>
          </UsersTable>
        </ComponentCard>
      </div>

      <AddUser v-if="usersStore.modalType === 'add'" />
      <EditUser
        v-if="usersStore.modalType === 'edit'"
        :user="usersStore.selectedUser"
      />
      <ViewUser
        v-if="usersStore.modalType === 'view'"
        :user="usersStore.selectedUser"
      />
      <DeleteUser
        v-if="usersStore.modalType === 'delete'"
        :user="usersStore.selectedUser"
      />
    </UsersLayout>
  </AppLayout>
</template>
