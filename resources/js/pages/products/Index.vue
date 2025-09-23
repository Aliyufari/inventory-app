<script setup lang="ts">
import { computed, onMounted } from "vue"
import { Head, useForm, usePage } from "@inertiajs/vue3"
import AppLayout from "@/layouts/AppLayout.vue"
import ProductLayout from "@/layouts/products/Layout.vue"
import { type BreadcrumbItem, type SharedData, type User } from "@/types"
import ComponentCard from "@/components/ui/card/ComponentCard.vue"
import ProductsTable from "@/components/ui/table/ProductsTable.vue"
import AddProduct from "@/pages/products/AddProduct.vue"
import EditProduct from "@/pages/products/EditProduct.vue"
import ViewProduct from "@/pages/products/ViewProduct.vue"
import DeleteProduct from "@/pages/products/DeleteProduct.vue"
import { Button } from "@/components/ui/button"
import { useProduct } from "@/stores/products"
import { BriefcaseMedical } from "lucide-vue-next"

interface Props {
  products?: unknown[]
}

defineProps<Props>()

const breadcrumbs: BreadcrumbItem[] = [{ title: "Manage Products", href: "/products" }]

const page = usePage<SharedData>()
const authUser = page.props.auth.user as User

const form = useForm({ name: authUser.name, email: authUser.email })

const productStore = useProduct()
// const products = computed(() => productStore.products)

onMounted(() => {
  if (!productStore.products.length) {
    productStore.fetchProducts()
  }
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Products" />

    <ProductLayout>
      <template #button>
        <Button @click="productStore.openModal('add')">
          <BriefcaseMedical class="mr-2" />+ Add Product
        </Button>
      </template>

      <div class="space-y-5 sm:space-y-6">
        <ComponentCard>
          <ProductsTable
            :data="products"
            @edit="productStore.openModal('edit', $event)"
            @view="productStore.openModal('view', $event)"
            @delete="productStore.openModal('delete', $event)"
          />
        </ComponentCard>
      </div>

      <!-- Modals -->
      <AddProduct
        v-if="productStore.modalType === 'add'"
        @saved="productStore.fetchProducts()"
      />
      <EditProduct
        v-if="productStore.modalType === 'edit'"
        :product="productStore.selectedProduct"
        @updated="productStore.fetchProducts()"
      />
      <ViewProduct
        v-if="productStore.modalType === 'view'"
        :product="productStore.selectedProduct"
      />
      <DeleteProduct
        v-if="productStore.modalType === 'delete'"
        :product="productStore.selectedProduct"
        @deleted="productStore.fetchProducts()"
      />
    </ProductLayout>
  </AppLayout>
</template>
