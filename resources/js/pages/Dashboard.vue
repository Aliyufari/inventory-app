<script setup lang="ts">
import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'
import DashboardCard from '@/components/DashboardCard.vue'
import { Users, BriefcaseMedical, Section, ShieldAlert } from 'lucide-vue-next'
import AppLayout from '@/layouts/AppLayout.vue'
import { BreadcrumbItem } from '@/types'
import PieChart from '@/components/charts/PieChart.vue'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Dashboard', href: '/dashboard' },
]

const page = usePage()
const stats = computed(() => page.props.statistics || {})

console.log('📊 Dashboard Stats:', stats.value)

const medicationData = [
  { label: 'Antibiotics', value: 120, backgroundColor: '#4e79a7' },
  { label: 'Pain Relief', value: 85, backgroundColor: '#f28e2b' },
  { label: 'Cardiovascular', value: 65, backgroundColor: '#e15759' },
  { label: 'Antidepressants', value: 45, backgroundColor: '#76b7b2' },
  { label: 'Diabetes', value: 38, backgroundColor: '#59a14f' },
  { label: 'Other', value: 27, backgroundColor: '#edc948' }
]
</script>

<template>
  <Head title="Dashboard" />
  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
      <!-- Stat Cards -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          :value="stats.total_users"
          link="/users"
          description="Users"
          :icon="Users"
          iconBgColor="#FFF8E1"
          iconColor="#FED600"
        />
        <DashboardCard
          :value="stats.total_products"
          link="/products"
          description="Products"
          :icon="BriefcaseMedical"
          iconColor="#009099"
          iconBgColor="#80DEEA"
        />
        <DashboardCard
          :value="stats.total_categories"
          link="/categories"
          description="Categories"
          :icon="Section"
          iconColor="#3B82F6"
          iconBgColor="#DBEAFE"
        />
        <DashboardCard
          :value="stats.product_shortage"
          link="/products"
          description="Shortage"
          :icon="ShieldAlert"
          iconColor="#F0483E"
          iconBgColor="#EF9A9A"
        />
      </div>

      <!-- Pie Chart -->
      <div class="relative min-h-[100vh] flex-1 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border md:min-h-min">
        <PieChart title="Prescription Categories Distribution" :initial-data="medicationData" />
      </div>
    </div>
  </AppLayout>
</template>
