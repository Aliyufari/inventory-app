<script setup lang="ts">
import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'
import { useReportStore } from '@/stores/reports'
import { useInvoice } from '@/stores/invoice'
import { ArrowUpDown, Printer } from 'lucide-vue-next'
import Pagination from '../components/Pagination.vue'

const page = usePage()
const report = useReportStore()
const invoiceStore = useInvoice()

const sales = computed(() => page.props.sales.data || [])
const pagination = computed(() => page.props.sales)

const money = (value: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(value ?? 0)

const sort = (column: string) => {
  report.sort(column)
}

const formatDate = (date: string | Date) => {
  if (!date) return '—'

  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

const printReceipt = async (saleId: string) => {
  try {
    await invoiceStore.fetchInvoice(saleId)
  } catch (error) {
    console.error('Error printing receipt:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- ================= TABLE CARD ================= -->
    <div
      class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 z-10 bg-gray-50">
            <tr
              class="border-b border-gray-200
                     text-[11px] font-semibold text-gray-600
                     uppercase tracking-wider"
            >
              <th class="px-6 py-3 text-left">Invoice</th>

              <th
                class="px-6 py-3 text-left cursor-pointer hover:text-gray-900"
                @click="sort('created_at')"
              >
                <div class="inline-flex items-center gap-1">
                  Date
                  <ArrowUpDown class="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>

              <th class="px-6 py-3 text-left">Customer</th>
              <th class="px-6 py-3 text-left">Store</th>
              <th class="px-6 py-3 text-left">Payment</th>
              <th class="px-6 py-3 text-left">Cashier</th>

              <th
                class="px-6 py-3 text-right cursor-pointer hover:text-gray-900"
                @click="sort('total')"
              >
                <div class="inline-flex justify-end items-center gap-1">
                  Total
                  <ArrowUpDown class="w-3.5 h-3.5 opacity-60" />
                </div>
              </th>

              <th class="px-6 py-3 text-left">Status</th>
              <th class="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="sale in sales"
              :key="sale.id"
              class="hover:bg-gray-50 even:bg-gray-50/50"
            >
              <td class="px-6 py-3 font-mono text-xs text-gray-700">
                {{ sale.invoice_number }}
              </td>

              <td class="px-6 py-3 text-gray-600 whitespace-nowrap">
                {{ formatDate(sale.created_at) }}
              </td>

              <td class="px-6 py-3 font-medium text-gray-800">
                {{ sale.customer?.name || 'Walk-in' }}
              </td>

              <td class="px-6 py-3 text-gray-600">
                {{ sale.store?.name || 'N/A' }}
              </td>

              <td class="px-6 py-3 capitalize">
                {{ sale.payment_method }}
              </td>

              <td class="px-6 py-3">
                {{ sale.user?.name }}
              </td>

              <td class="px-6 py-3 text-right font-semibold tabular-nums">
                {{ money(sale.total) }}
              </td>

              <td class="px-6 py-3">
                <span
                  class="inline-flex px-3 py-1 rounded-full
                         text-[11px] font-semibold ring-1 capitalize"
                  :class="
                    sale.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                      : sale.status === 'pending'
                      ? 'bg-yellow-50 text-yellow-700 ring-yellow-200'
                      : 'bg-red-50 text-red-700 ring-red-200'
                  "
                >
                  {{ sale.status }}
                </span>
              </td>

              <td class="px-6 py-3 text-center">
                <button
                  @click="printReceipt(sale.id)"
                  :disabled="invoiceStore.isGenerating"
                  class="inline-flex items-center justify-center
                         p-2 rounded-lg
                         bg-teal-50 text-teal-600
                         hover:bg-teal-100 hover:text-teal-700
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors duration-200"
                  title="Print Receipt"
                >
                  <Printer class="w-4 h-4" />
                </button>
              </td>
            </tr>

            <tr v-if="!sales.length">
              <td colspan="9" class="py-20 text-center">
                <p class="font-semibold text-gray-700">
                  No sales found
                </p>
                <p class="text-sm text-gray-400 mt-1">
                  Try adjusting date range or filters
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <section
        class="flex justify-end px-6 py-4 border-t bg-gray-50"
      >
        <Pagination
          v-if="pagination.last_page > 1"
          :links="pagination.links"
          :current-page="pagination.current_page"
          :total-pages="pagination.last_page"
          @change="report.salesReport"
        />
      </section>
    </div>
  </div>
</template>