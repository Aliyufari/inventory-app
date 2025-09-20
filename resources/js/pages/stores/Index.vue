<script setup lang="ts">
import { computed, onMounted } from "vue";
import { Head, useForm, usePage } from "@inertiajs/vue3";
import AppLayout from "@/layouts/AppLayout.vue";
import StoreLayout from "@/layouts/stores/Layout.vue";
import { type BreadcrumbItem, type SharedData, type User } from "@/types";
import ComponentCard from "@/components/ui/card/ComponentCard.vue";
import StoresTable from "@/components/ui/table/StoresTable.vue";
import AddStore from "@/pages/stores/AddStore.vue";
import EditStore from "@/pages/stores/EditStore.vue";
import ViewStore from "@/pages/stores/ViewStore.vue";
import DeleteStore from "@/pages/stores/DeleteStore.vue";
import { Button } from "@/components/ui/button";
import Heading from "@/components/Heading.vue";
import { useStore } from "@/stores/stores";
import { Store } from "lucide-vue-next";

interface Props {
  mustVerifyEmail: boolean;
  status?: string;
  stores?: unknown[];
}

defineProps<Props>();

const breadcrumbs: BreadcrumbItem[] = [{ title: "Manage stores", href: "/stores" }];

const page = usePage<SharedData>();
const user = page.props.auth.user as User;

const form = useForm({
  name: user.name,
  email: user.email,
});

const storeStore = useStore();
const stores = computed(() => storeStore.stores);

const submit = () => {
  form.patch(route("profile.update"), { preserveScroll: true });
};

onMounted(() => {
  if (!storeStore.stores?.length) {
    storeStore.fetchStores();
  }
});
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Stores" />

    <StoreLayout>
      <template #button>
        <Button @click="storeStore.openModal('add')"><Store class="-mr-2" />+ Add Store</Button>
      </template>


      <div class="space-y-5 sm:space-y-6">
        <ComponentCard>
          <StoresTable :data="stores">
            <template #view="{ store }">
              <ViewStore :store="store" />
            </template>

            <template #edit="{ store }">
              <EditStore :store="store" />
            </template>

            <template #default="{ store }">
              <DeleteStore :store="store" />
            </template>
          </StoresTable>
        </ComponentCard>
      </div>

      <AddStore v-if="storeStore.modalType === 'add'" />
      <EditStore
        v-if="storeStore.modalType === 'edit'"
        :store="storeStore.selectedStore"
      />
      <ViewStore
        v-if="storeStore.modalType === 'view'"
        :store="storeStore.selectedStore"
      />
      <DeleteStore
        v-if="storeStore.modalType === 'delete'"
        :store="storeStore.selectedStore"
      />
    </StoreLayout>
  </AppLayout>
</template>
