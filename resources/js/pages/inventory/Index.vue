<script setup lang="ts">
import { onMounted } from "vue"
import { Head, usePage } from "@inertiajs/vue3"
import AppLayout from "@/layouts/AppLayout.vue"
import InventoryLayout from "@/layouts/inventory/Layout.vue"
import { type BreadcrumbItem, type SharedData, type User } from "@/types"
import ComponentCard from "@/components/ui/card/ComponentCard.vue"
import InventoryTable from "@/components/ui/table/InventoryTable.vue"
import AddInventory from "@/pages/inventory/AddInventory.vue"
// import InvoicePreview from "@/pages/inventory/InvoivePreview.vue"
import { Button } from "@/components/ui/button"
import { useInvoice } from "@/stores/invoice"
import { Plus } from "lucide-vue-next"
import Pagination from "@/pages/components/Pagination.vue"
import SearchableInput from "@/components/ui/input/SearchableInput.vue"

const breadcrumbs: BreadcrumbItem[] = [{ title: "Inventory", href: "/inventory" }]

const page = usePage<SharedData>()
const authUser = page.props.auth.user as User
const inventoryStore = useInvoice()

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
            <SearchableInput
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