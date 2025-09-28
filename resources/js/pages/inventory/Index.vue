<script setup lang="ts">
import { onMounted } from "vue"
import { Head, usePage, useForm } from "@inertiajs/vue3"
import AppLayout from "@/layouts/AppLayout.vue"
import InventoryLayout from "@/layouts/inventory/Layout.vue"
import { type BreadcrumbItem, type SharedData, type User } from "@/types"
import ComponentCard from "@/components/ui/card/ComponentCard.vue"
import InventoryTable from "@/components/ui/table/InventoryTable.vue"
import AddInventory from "@/pages/inventory/AddInventory.vue"
import EditInventory from "@/pages/inventory/EditInventory.vue"
import ViewInventory from "@/pages/inventory/ViewInventory.vue"
import DeleteInventory from "@/pages/inventory/DeleteInventory.vue"
import { Button } from "@/components/ui/button"
import { useInventory } from "@/stores/inventory"
import { Plus } from "lucide-vue-next"
import Pagination from "@/pages/components/Pagination.vue"
import SearchInput from "@/pages/components/SeachInput.vue"

const breadcrumbs: BreadcrumbItem[] = [{ title: "Inventory", href: "/inventory" }]

const page = usePage<SharedData>()
const authUser = page.props.auth.user as User
const form = useForm({ name: authUser.name, email: authUser.email })

const inventoryStore = useInventory()

onMounted(() => {
  if (!inventoryStore.inventories?.length) {
    inventoryStore.fetchInventories()
  }
})

const handleSearch = () => {
  inventoryStore.fetchInventories(1) 
}
</script>
<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Inventory" />

    <InventoryLayout>
      <template #button>
        <Button @click="inventoryStore.openModal('add')">
          <Plus class="mr-2" /> New Transaction
        </Button>
      </template>

      <div class="space-y-5 sm:space-y-6">
        <ComponentCard>
          <div class="mb-4">
            <SearchInput
              v-model="inventoryStore.search"
              placeholder="Search inventory..."
              @search="handleSearch"
            />
          </div>

          <InventoryTable
            :data="inventoryStore.inventories"
            @edit="inventoryStore.openModal('edit', $event)"
            @view="inventoryStore.openModal('view', $event)"
            @delete="inventoryStore.openModal('delete', $event)"
          />

          <Pagination
            v-if="inventoryStore.pagination"
            :links="inventoryStore.pagination.links"
            :meta="inventoryStore.pagination.meta"
            :onPageChange="page => inventoryStore.fetchInventories(page)"
          />
        </ComponentCard>
      </div>

      <!-- Modals -->
      <AddInventory
        v-if="inventoryStore.modalType === 'add'"
        @saved="inventoryStore.fetchInventories()"
      />
      <EditInventory
        v-if="inventoryStore.modalType === 'edit'"
        :inventory="inventoryStore.selected"
        @updated="inventoryStore.fetchInventories()"
      />
      <ViewInventory
        v-if="inventoryStore.modalType === 'view'"
        :inventory="inventoryStore.selected"
      />
      <DeleteInventory
        v-if="inventoryStore.modalType === 'delete'"
        :inventory="inventoryStore.selected"
        @deleted="inventoryStore.fetchInventories()"
      />
    </InventoryLayout>
  </AppLayout>
</template>
