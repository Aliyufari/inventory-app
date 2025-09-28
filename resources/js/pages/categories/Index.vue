<script setup lang="ts">
import { computed, onMounted } from "vue"
import { Head, useForm, usePage } from "@inertiajs/vue3"
import AppLayout from "@/layouts/AppLayout.vue"
import CategoryLayout from "@/layouts/categories/Layout.vue"
import { type Category, type BreadcrumbItem, type SharedData, type User } from "@/types"
import ComponentCard from "@/components/ui/card/ComponentCard.vue"
import CategoriesTable from "@/components/ui/table/CategoriesTable.vue"
import AddCategory from "@/pages/categories/AddCategory.vue"
import EditCategory from "@/pages/categories/EditCategory.vue"
import ViewCategory from "@/pages/categories/ViewCategory.vue"
import DeleteCategory from "@/pages/categories/DeleteCategory.vue"
import { Button } from "@/components/ui/button"
import { useCategory } from "@/stores/categories"
import { Section } from "lucide-vue-next"
import Pagination from "@/pages/components/Pagination.vue"
import SearchInput from "@/pages/components/SeachInput.vue"

const breadcrumbs: BreadcrumbItem[] = [{ title: "Manage categories", href: "/categories" }]

interface Props {
  mustVerifyEmail: boolean
  status?: string
  categories?: Category | unknown[]
}

defineProps<Props>()

const page = usePage<SharedData>()
const user = page.props.auth.user as User

const form = useForm({
  name: user.name,
  email: user.email,
})

const categoryStore = useCategory()

onMounted(() => {
  if (!categoryStore.categories?.length) {
    categoryStore.fetchCategories()
  }
})

const handleSearch = () => {
  categoryStore.fetchCategories(1) 
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Categories" />

    <CategoryLayout>
      <template #button>
        <Button @click="categoryStore.openModal('add')">
          <Section class="mr-2" />+ Add Category
        </Button>
      </template>

      <div class="space-y-5 sm:space-y-6">
        <ComponentCard>
          <div class="mb-4">
            <SearchInput
              v-model="categoryStore.search"
              placeholder="Search category..."
              @search="handleSearch"
            />
          </div>

          <CategoriesTable
            :data="categoryStore.categories"
            @edit="categoryStore.openModal('edit', $event)"
            @view="categoryStore.openModal('view', $event)"
            @delete="categoryStore.openModal('delete', $event)"
          />

          <Pagination
            v-if="categoryStore.pagination"
            :links="categoryStore.pagination.links"
            :meta="categoryStore.pagination.meta"
            :onPageChange="page => categoryStore.fetchCategories(page)"
          />
        </ComponentCard>
      </div>

      <!-- Modals -->
      <AddCategory
        v-if="categoryStore.modalType === 'add'"
        @saved="categoryStore.fetchCategories()"
      />
      <EditCategory
        v-if="categoryStore.modalType === 'edit'"
        :category="categoryStore.selectedCategory"
        @updated="categoryStore.fetchCategories()"
      />
      <ViewCategory
        v-if="categoryStore.modalType === 'view'"
        :category="categoryStore.selectedCategory"
      />
      <DeleteCategory
        v-if="categoryStore.modalType === 'delete'"
        :category="categoryStore.selectedCategory"
        @deleted="categoryStore.fetchCategories()"
      />
    </CategoryLayout>
  </AppLayout>
</template>
