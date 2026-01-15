<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { Head, usePage } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'
import Layout from '@/layouts/reports/SalesReportLayout.vue'
import { type BreadcrumbItem } from '@/types'
import SalesReportTable from '@/pages/reports/SalesReportTable.vue'
import { useReportStore } from '@/stores/reports'
import InvoicePreview from "@/pages/sales/InvoivePreview.vue"

// Props from Inertia
const props = defineProps<{
  sales: any
  summary: any
  stores: any
  filters: any
  customers: any
  users: any
  payment_methods: string[]
  statuses: string[]
}>()

// Pinia store
const report = useReportStore()

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Sales Reports', href: '/sales-reports' },
]

// Initialize store with filters from backend
onMounted(() => {
  report.filters = { ...report.filters, ...props.filters }
})

const applyFilters = () => {
  report.salesReport()
}

const resetFilters = () => {
  report.resetFilters()
}

const page = usePage();
const user = page.props.auth.user;

// Only super and owner can see summary cards
const canViewCards = computed(() => {
  return user?.role?.name === 'super' || user?.role?.name === 'owner';
});
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Sales Reports" />

    <Layout>
      <div class="space-y-6">
        
        <!-- ================= FILTER CARD ================= -->
        <section
        class="bg-white border border-gray-200 rounded-2xl shadow-sm
                px-4 sm:px-6 py-5"
        >
        <!-- Header -->
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between
                gap-4 mb-5"
        >
            <div>
            <h2 class="text-lg font-semibold text-gray-900">
                Sales Report
            </h2>
            <p class="text-sm text-gray-500">
                Filter and analyze sales transactions
            </p>
            </div>
        </div>

        <!-- Filters -->
        <div
            class="grid gap-3
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-12 items-end"
        >
            <!-- From Date -->
            <div class="xl:col-span-2">
            <label class="text-xs font-semibold text-gray-600 uppercase">
                From
            </label>
            <input
                v-model="report.filters.from"
                type="date"
                class="h-10 w-full rounded-lg border border-gray-300 px-2
                    text-sm text-gray-700
                    focus:ring-2 focus:ring-primary/30
                    focus:border-primary outline-none transition"
            />
            </div>

            <!-- To Date -->
            <div class="xl:col-span-2">
            <label class="text-xs font-semibold text-gray-600 uppercase">
                To
            </label>
            <input
                v-model="report.filters.to"
                type="date"
                class="h-10 w-full rounded-lg border border-gray-300 px-2
                    text-sm text-gray-700
                    focus:ring-2 focus:ring-primary/30
                    focus:border-primary outline-none transition"
            />
            </div>

            <!-- Store -->
            <div class="xl:col-span-2">
            <label class="text-xs font-semibold text-gray-600 uppercase">
                Store
            </label>
            <select
                v-model="report.filters.store_id"
                class="h-10 w-full rounded-lg border border-gray-300 px-3
                    text-sm text-gray-700 bg-white
                    focus:ring-2 focus:ring-primary/30
                    focus:border-primary outline-none transition"
            >
                <option value="">All Stores</option>
                <option
                v-for="store in props.stores"
                :key="store.id"
                :value="store.id"
                >
                {{ store.name }}
                </option>
            </select>
            </div>

            <!-- Customer -->
            <div class="xl:col-span-2">
            <label class="text-xs font-semibold text-gray-600 uppercase">
                Customer
            </label>
            <select
                v-model="report.filters.customer_id"
                class="h-10 w-full rounded-lg border border-gray-300 px-3
                    text-sm text-gray-700 bg-white
                    focus:ring-2 focus:ring-primary/30
                    focus:border-primary outline-none transition"
            >
                <option value="">All Customers</option>
                <option
                v-for="customer in props.customers"
                :key="customer.id"
                :value="customer.id"
                >
                {{ customer.name }}
                </option>
            </select>
            </div>

            <!-- Payment -->
            <div class="xl:col-span-1">
            <label class="text-xs font-semibold text-gray-600 uppercase">
                Payment
            </label>
            <select
                v-model="report.filters.payment_method"
                class="h-10 w-full rounded-lg border border-gray-300 px-2
                    text-sm text-gray-700 bg-white
                    focus:ring-2 focus:ring-primary/30
                    focus:border-primary outline-none transition"
            >
                <option value="">All</option>
                <option
                v-for="method in props.payment_methods"
                :key="method"
                :value="method"
                >
                {{ method }}
                </option>
            </select>
            </div>

            <!-- Status -->
            <div class="xl:col-span-1">
            <label class="text-xs font-semibold text-gray-600 uppercase">
                Status
            </label>
            <select
                v-model="report.filters.status"
                class="h-10 w-full rounded-lg border border-gray-300 px-2
                    text-sm text-gray-700 bg-white
                    focus:ring-2 focus:ring-primary/30
                    focus:border-primary outline-none transition"
            >
                <option value="">All</option>
                <option
                v-for="status in props.statuses"
                :key="status"
                :value="status"
                >
                {{ status }}
                </option>
            </select>
            </div>

            <!-- Actions -->
            <div
            class="xl:col-span-2 flex gap-2 justify-end"
            >
            <button
                @click="applyFilters"
                class="h-10 px-5 rounded-lg
                    bg-primary text-white
                    font-semibold text-sm
                    hover:bg-primary/90 transition"
            >
                Apply
            </button>

            <button
                @click="resetFilters"
                class="h-10 px-5 rounded-lg
                    border border-gray-300
                    text-gray-700 font-semibold text-sm
                    hover:bg-gray-50 transition"
            >
                Reset
            </button>
            </div>
        </div>
        </section>

        <!-- ================= SUMMARY CARDS ================= -->
        <div v-if="canViewCards" class="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 
                    rounded-2xl p-5 border border-blue-200/50 shadow-sm">
            <div class="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Total Sales
            </div>
            <div class="text-2xl font-bold text-gray-900">
            {{ props.summary.total_sales }}
            </div>
        </div>

        <div class="bg-gradient-to-br from-green-50 to-green-100/50 
                    rounded-2xl p-5 border border-green-200/50 shadow-sm">
            <div class="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
            Subtotal
            </div>
            <div class="text-2xl font-bold text-gray-900">
            {{ props.summary.subtotal }}
            </div>
        </div>

        <div class="bg-gradient-to-br from-yellow-50 to-yellow-100/50 
                    rounded-2xl p-5 border border-yellow-200/50 shadow-sm">
            <div class="text-xs font-semibold text-yellow-600 uppercase tracking-wide mb-1">
            Gross Total
            </div>
            <div class="text-2xl font-bold text-gray-900">
            {{ props.summary.gross_total }}
            </div>
        </div>

        <div class="bg-gradient-to-br from-red-50 to-red-100/50 
                    rounded-2xl p-5 border border-red-200/50 shadow-sm">
            <div class="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">
            Total Discount
            </div>
            <div class="text-2xl font-bold text-gray-900">
            {{ props.summary.total_discount }}
            </div>
        </div>

        <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 
                    rounded-2xl p-5 border border-purple-200/50 shadow-sm">
            <div class="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
            Net Total
            </div>
            <div class="text-2xl font-bold text-gray-900">
            {{ props.summary.net_total }}
            </div>
        </div>
        </div>

        <!-- Table -->
        <SalesReportTable />
        <InvoicePreview />
      </div>
    </Layout>
  </AppLayout>
</template>