<script setup lang="ts">
import { onMounted } from "vue"
import { Head, usePage } from "@inertiajs/vue3"
import AppLayout from "@/layouts/AppLayout.vue"
import InventoryLayout from "@/layouts/inventory/Layout.vue"
import { type BreadcrumbItem, type SharedData, type User } from "@/types"
import ComponentCard from "@/components/ui/card/ComponentCard.vue"
import InventoryTable from "@/components/ui/table/InventoryTable.vue"
import AddInventory from "@/pages/inventory/AddInventory.vue"
import EditInventory from "@/pages/inventory/EditInventory.vue"
import ViewInventory from "@/pages/inventory/ViewInventory.vue"
import DeleteInventory from "@/pages/inventory/DeleteInventory.vue"
import InvoicePreview from "@/pages/inventory/InvoivePreview.vue"
import { Button } from "@/components/ui/button"
import { useInventory } from "@/stores/invoice"
import { Plus } from "lucide-vue-next"
import Pagination from "@/pages/components/Pagination1.vue"
import SearchInput from "@/pages/components/SeachInput.vue"

const breadcrumbs: BreadcrumbItem[] = [{ title: "Inventory", href: "/inventory" }]

const page = usePage<SharedData>()
const authUser = page.props.auth.user as User
const inventoryStore = useInventory()

// Initialize shared data when component mounts
onMounted(async () => {
  if (!inventoryStore.inventories?.length) {
    inventoryStore.fetchInventories()
  }
  
  // Initialize options once for the entire app
  if (!inventoryStore.optionsInitialized) {
    await inventoryStore.initializeOptions()
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

          <InventoryTable />

          <Pagination
            v-if="inventoryStore.pagination"
            :links="inventoryStore.pagination.links"
            :meta="inventoryStore.pagination.meta"
            :onPageChange="(pageNum) => inventoryStore.fetchInventories(pageNum)"
          />
        </ComponentCard>
      </div>

      <!-- Modals -->
      <AddInventory
        v-if="inventoryStore.modalType === 'add'"
        @saved="inventoryStore.fetchInventories()"
      />

      <InvoicePreview />
    </InventoryLayout>
  </AppLayout>
</template>