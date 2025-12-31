<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
import { computed, ref } from 'vue'
import { TrendingUp, ShoppingCart, Package, DollarSign } from 'lucide-vue-next'

/* ====================== Sales Trend Chart ====================== */
const salesTrendSeries = ref([
  { name: 'Revenue', data: [3200, 4100, 5000, 4500, 5200, 6100, 5800] }
])
const salesTrendOptions = ref({
  chart: { toolbar: { show: false }, zoom: { enabled: false } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'] },
  yaxis: { title: { text: 'Revenue ($)' } },
  tooltip: { theme: 'dark' },
  grid: { borderColor: '#e5e7eb' }
})

/* ====================== Top Products Chart ====================== */
const topProductsSeries = ref([
  { name: 'Units Sold', data: [120, 95, 80, 75, 60, 55, 40] }
])
const topProductsOptions = ref({
  chart: { toolbar: { show: false } },
  plotOptions: { bar: { borderRadius: 8, horizontal: false } },
  dataLabels: { enabled: false },
  xaxis: { categories: ['Rice', 'Soda', 'Chips', 'Soap', 'Milk', 'Eggs', 'Bread'] },
  tooltip: { theme: 'dark' },
  grid: { borderColor: '#e5e7eb' }
})

/* ====================== Category Distribution (Donut) ====================== */
const categoryDistributionSeries = ref([320, 210, 180, 140, 90])
const categoryDistributionOptions = ref({
  labels: ['Groceries', 'Beverages', 'Snacks', 'Household', 'Others'],
  legend: { position: 'bottom' },
  tooltip: { theme: 'dark' },
  responsive: [
    {
      breakpoint: 480,
      options: { chart: { width: '100%' }, legend: { position: 'bottom' } }
    }
  ]
})

/* ====================== Stock Status Chart ====================== */
const stockStatusSeries = ref([
  { name: 'Stock', data: [150, 130, 160, 140, 170, 180, 190] }
])
const stockStatusOptions = ref({
  chart: { toolbar: { show: false }, zoom: { enabled: false } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  yaxis: { title: { text: 'Units in Stock' } },
  tooltip: { theme: 'dark' },
  grid: { borderColor: '#e5e7eb' }
})
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">

    <!-- Category Distribution Chart -->
    <div class="rounded-xl border border-sidebar-border/70 bg-white dark:bg-gray-800 dark:border-sidebar-border p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Category Distribution</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Sales by category</p>
        </div>
        <div class="rounded-lg bg-blue-100 dark:bg-blue-900/20 p-3">
          <Package class="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
      <VueApexCharts type="donut" height="350" :options="categoryDistributionOptions" :series="categoryDistributionSeries" />
    </div>

    <!-- Top Products Chart -->
    <div class="rounded-xl border border-sidebar-border/70 bg-white dark:bg-gray-800 dark:border-sidebar-border p-6 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Top Selling Products</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">Best performers this month</p>
        </div>
        <div class="rounded-lg bg-purple-100 dark:bg-purple-900/20 p-3">
          <ShoppingCart class="h-6 w-6 text-purple-600 dark:text-purple-400" />
        </div>
      </div>
      <VueApexCharts type="bar" height="350" :options="topProductsOptions" :series="topProductsSeries" />
    </div>

  </div>
</template>

