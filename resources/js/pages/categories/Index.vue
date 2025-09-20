<script setup lang="ts">
import { computed, onMounted } from "vue";
import { Head, useForm, usePage } from "@inertiajs/vue3";
import AppLayout from "@/layouts/AppLayout.vue";
import CategoryLayout from "@/layouts/categories/Layout.vue";
import { type BreadcrumbItem, type SharedData, type User } from "@/types";
import ComponentCard from "@/components/ui/card/ComponentCard.vue";
import CategoriesTable from "@/components/ui/table/CategoriesTable.vue";
import AddCategory from "@/pages/categories/AddCategory.vue";
import EditCategory from "@/pages/categories/EditCategory.vue";
import ViewCategory from "@/pages/categories/ViewCategory.vue";
import DeleteCategory from "@/pages/categories/DeleteCategory.vue";
import { Button } from "@/components/ui/button";
import { useCategory } from "@/stores/categories";
import { Section } from "lucide-vue-next";

interface Props {
  mustVerifyEmail: boolean;
  status?: string;
  stores?: unknown[];
}

defineProps<Props>();

const breadcrumbs: BreadcrumbItem[] = [{ title: "Manage categories", href: "/categories" }];

const page = usePage<SharedData>();
const user = page.props.auth.user as User;

const form = useForm({
  name: user.name,
  email: user.email,
});

const categoryStore = useCategory();
const stores = computed(() => categoryStore.stores);

const submit = () => {
  form.patch(route("profile.update"), { preserveScroll: true });
};

onMounted(() => {
  if (!categoryStore.stores?.length) {
    categoryStore.fetchCategories();
  }
});
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Categories" />

    <CategoryLayout>
      <template #button>
        <Button @click="categoryStore.openModal('add')"><Section class="-mr-3" />+ Add Category</Button>
      </template>


      <div class="space-y-5 sm:space-y-6">
        <ComponentCard>
          <CategoriesTable :data="categoryStore.categories">
            <template #view="{ category }">
              <ViewCategory :category="category" />
            </template>

            <template #edit="{ category }">
              <EditCategory :category="category" />
            </template>

            <template #default="{ category }">
              <DeleteCategory :category="category" />
            </template>
          </CategoriesTable>
        </ComponentCard>
      </div>

      <AddCategory v-if="categoryStore.modalType === 'add'" />
      <EditCategory
        v-if="categoryStore.modalType === 'edit'"
        :category="categoryStore.selectedCategory"
      />
      <ViewCategory
        v-if="categoryStore.modalType === 'view'"
        :category="categoryStore.selectedCategory"
      />
      <DeleteCategory
        v-if="categoryStore.modalType === 'delete'"
        :category="categoryStore.selectedCategory"
      />
    </CategoryLayout>
  </AppLayout>
</template>
