<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { Head } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'
import ProductLayout from '@/layouts/products/Layout.vue'
import { type BreadcrumbItem } from '@/types'
import AddProduct from '@/pages/products/AddProduct.vue'
import EditProduct from '@/pages/products/EditProduct.vue'
import ViewProduct from '@/pages/products/ViewProduct.vue'
import DeleteProduct from '@/pages/products/DeleteProduct.vue'
import { Button } from '@/components/ui/button'
import { useProduct } from '@/stores/products'
import { Package } from 'lucide-vue-next'
import ProductsTable from '@/pages/products/ProductsTable.vue'

const props = defineProps<{
  data: any
  categories: any
  stores: any
}>()

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Manage Products', href: '/products' },
]

const productStore = useProduct()

onMounted(() => {
  productStore.setProducts(props.data, props.categories, props.stores)
})

watch(() => props.data, (newData) => {
  productStore.setProducts(newData, props.categories, props.stores)
}, { deep: true })
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Products" />

    <ProductLayout>
      <template #button>
        <Button @click="productStore.openAdd()">
          <Package class="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </template>

      <div class="space-y-5 sm:space-y-6">
        <ProductsTable />
      </div>

      <!-- MODALS -->
      <AddProduct
        v-if="productStore.modalType === 'add'"
        @saved="productStore.closeModal"
      />

      <EditProduct
        v-if="productStore.modalType === 'edit'"
        :product="productStore.selectedProduct"
        @updated="productStore.closeModal"
      />

      <ViewProduct
        v-if="productStore.modalType === 'view'"
        :product="productStore.selectedProduct"
        @close="productStore.closeModal"
      />

      <DeleteProduct
        v-if="productStore.modalType === 'delete'"
        :product="productStore.selectedProduct"
        @deleted="productStore.closeModal"
      />
    </ProductLayout>
  </AppLayout>
</template>
