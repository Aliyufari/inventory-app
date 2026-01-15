<script setup lang="ts">
import { onMounted } from "vue"
import { Head, usePage } from "@inertiajs/vue3"
import AppLayout from "@/layouts/AppLayout.vue"
import StoreLayout from "@/layouts/stores/Layout.vue"
import { type Store, type BreadcrumbItem, type SharedData, type User } from "@/types"
import ComponentCard from "@/components/ui/card/ComponentCard.vue"
import StoresTable from "@/components/ui/table/StoresTable.vue"
import AddStore from "@/pages/stores/AddStore.vue"
import EditStore from "@/pages/stores/EditStore.vue"
import ViewStore from "@/pages/stores/ViewStore.vue"
import DeleteStore from "@/pages/stores/DeleteStore.vue"
import { Button } from "@/components/ui/button"
import { useStore } from "@/stores/stores"
import { Store as StoreIcon } from "lucide-vue-next"
import Pagination from "@/pages/components/Pagination.vue"
import { SearchableInput } from "@/components/ui/input"

const breadcrumbs: BreadcrumbItem[] = [{ title: "Manage stores", href: "/stores" }]

const page = usePage<SharedData>()
const user = page.props.auth.user as User

interface Props {
  mustVerifyEmail: boolean
  status?: string
  stores?: Store | unknown[]
}

defineProps<Props>()

// Pinia store
const storeStore = useStore()

// Fetch stores on mount if not already loaded
onMounted(() => {
  if (!storeStore.stores?.length) {
    storeStore.fetchStores()
  }
})

const handleSearch = () => {
  storeStore.fetchStores(1) 
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Stores" />

    <StoreLayout>
      <template #button>
        <Button @click="storeStore.openModal('add')">
          <StoreIcon class="mr-2" /> Add Store
        </Button>
      </template>

      <div class="space-y-5 sm:space-y-6">
        <ComponentCard>
          <!-- 🔍 Search input -->
          <div class="mb-4">
            <SearchableInput
              v-model="storeStore.search"
              placeholder="Search store..."
              @search="handleSearch"
            />
          </div>

          <!-- 📊 Stores Table -->
          <StoresTable
            :data="storeStore.stores"
            @edit="storeStore.openModal('edit', $event)"
            @view="storeStore.openModal('view', $event)"
            @delete="storeStore.openModal('delete', $event)"
          />

          <!-- 📄 Pagination -->
          <Pagination
            v-if="storeStore.pagination"
            :links="storeStore.pagination.links"
            :meta="storeStore.pagination.meta"
            :onPageChange="page => storeStore.fetchStores(page)"
          />
        </ComponentCard>
      </div>

      <!-- Modals -->
      <AddStore
        v-if="storeStore.modalType === 'add'"
        @saved="storeStore.fetchStores()"
      />
      <EditStore
        v-if="storeStore.modalType === 'edit'"
        :store="storeStore.selectedStore"
        @updated="storeStore.fetchStores()"
      />
      <ViewStore
        v-if="storeStore.modalType === 'view'"
        :store="storeStore.selectedStore"
      />
      <DeleteStore
        v-if="storeStore.modalType === 'delete'"
        :store="storeStore.selectedStore"
        @deleted="storeStore.fetchStores()"
      />
    </StoreLayout>
  </AppLayout>
</template>
