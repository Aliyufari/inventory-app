<script setup lang="ts">
import { computed } from 'vue'
import { Head, usePage } from '@inertiajs/vue3'
import DashboardCard from '@/components/DashboardCard.vue'
import { Users, Briefcase, Section, TriangleAlert } from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import { BreadcrumbItem } from '@/types'
import Chart from '@/components/charts/Chart.vue'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
]

const page = usePage()
const stats = computed(() => page.props.statistics || {})
</script>

<template>
  <Head title="Dashboard" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <!-- Stat Cards -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <DashboardCard
          :value="stats.total_users"
          description="Users"
          link="/users"
          :icon="Users"
          color="bg-blue-500"
        />
        <DashboardCard
          :value="stats.total_products"
          description="Products"
          link="/products"
          :icon="Briefcase"
          color="bg-emerald-500"
        />
        <DashboardCard
          :value="stats.total_categories"
          description="Categories"
          link="/categories"
          :icon="Section"
          color="bg-indigo-500"
        />
        <DashboardCard
          :value="stats.product_shortage"
          description="Low Stock"
          link="/products"
          :icon="TriangleAlert"
          color="bg-red-500"
        />
      </div>


      <!-- Chart -->
      <div class="relative min-h-[100vh] flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border md:min-h-min">
       <Chart />
      </div>
    </div>
  </AppLayout>
</template>
