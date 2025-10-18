<script setup lang="ts">
import { computed } from "vue"
import { useInventory } from "@/stores/inventory"

const inventoryStore = useInventory()

// Inventories list
const items = computed(() =>
  Array.isArray(inventoryStore.inventories)
    ? inventoryStore.inventories
    : inventoryStore.inventories?.value ?? []
)

// Format currency with Naira sign
const formatCurrency = (v: number) => {
  if (v == null || isNaN(v)) return "₦0.00"
  return `₦${v.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

// Format date nicely
const formatDate = (dateString: Date) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, 
  })
}

// 🖨 Handle invoice printing
const printInvoice = async (inv: any) => {
  const inventoryId = inv.id

  if (inventoryStore.isGenerating) return

  try {
    await inventoryStore.fetchInvoice(inventoryId)
  } catch (err) {
    console.error("Error generating invoice:", err)
  }
}
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white">
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-max w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="px-5 py-3 text-left whitespace-nowrap">#</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Invoice No</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Date</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Type</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Customer</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Payment</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Items</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Subtotal</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Discount</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Tax</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Total</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Status</th>
            <th class="px-5 py-3 text-left whitespace-nowrap"></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200">
          <tr v-for="(inv, index) in items" :key="inv.id">
            <td class="px-5 py-4 whitespace-nowrap">{{ index + 1 }}</td>
            <td class="px-5 py-4 whitespace-nowrap font-medium">
              {{ inv.invoice_number || "—" }}
            </td>
            <td class="px-5 py-4 whitespace-nowrap">
              {{ formatDate(inv.date || inv.created_at) }}
            </td>
            <td class="px-5 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium capitalize"
                :class="{
                  'bg-green-100 text-green-800': inv.type === 'sale',
                  'bg-blue-100 text-blue-800': inv.type === 'purchase',
                  'bg-gray-100 text-gray-800': !inv.type,
                }"
              >
                {{ inv.type || "—" }}
              </span>
            </td>
            <td class="px-5 py-4 whitespace-nowrap">
              {{ inv.customer?.name || inv.customer_name || "Walk-in" }}
            </td>
            <td class="px-5 py-4 whitespace-nowrap capitalize">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-800': inv.payment_method === 'cash',
                  'bg-blue-100 text-blue-800': inv.payment_method === 'transfer',
                  'bg-purple-100 text-purple-800': inv.payment_method === 'pos',
                  'bg-gray-100 text-gray-800': !inv.payment_method,
                }"
              >
                {{ inv.payment_method || "—" }}
              </span>
            </td>
            <td class="px-5 py-4 whitespace-nowrap text-center">
              <span
                class="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
              >
                {{ inv.items?.length || inv.total_items || 0 }}
              </span>
            </td>
            <td class="px-5 py-4 whitespace-nowrap">
              {{ formatCurrency(inv.subtotal || 0) }}
            </td>
            <td class="px-5 py-4 whitespace-nowrap">
              {{ formatCurrency(inv.discount || 0) }}
            </td>
            <td class="px-5 py-4 whitespace-nowrap">
              {{ formatCurrency(inv.tax || 0) }}
            </td>
            <td class="px-5 py-4 whitespace-nowrap font-semibold">
              {{ formatCurrency(inv.total || inv.grand_total || 0) }}
            </td>
            <td class="px-5 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium capitalize"
                :class="{
                  'bg-green-100 text-green-800': ['completed', 'paid'].includes(
                    inv.status
                  ),
                  'bg-yellow-100 text-yellow-800': inv.status === 'pending',
                  'bg-red-100 text-red-800': ['cancelled', 'refunded'].includes(
                    inv.status
                  ),
                  'bg-gray-100 text-gray-800': !inv.status,
                }"
              >
                {{ inv.status || "completed" }}
              </span>
            </td>
            <td class="px-5 py-4 whitespace-nowrap">
              <div class="flex gap-2">
                <button
                  @click="inventoryStore.openModal('view', inv)"
                  class="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="View Details"
                >
                  👁
                </button>
                <button
                  @click="inventoryStore.openModal('edit', inv)"
                  class="p-1 rounded hover:bg-gray-100 transition-colors"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  @click="printInvoice(inv)"
                  class="p-1 rounded hover:bg-blue-50 text-blue-600 transition-colors"
                  title="Print Invoice"
                  :disabled="inventoryStore.isGenerating"
                >
                  <span v-if="inventoryStore.isGenerating">⏳</span>
                  <span v-else>🖨️</span>
                </button>
                <button
                  @click="inventoryStore.openModal('delete', inv)"
                  class="p-1 rounded hover:bg-red-50 text-red-600 transition-colors"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </td>
          </tr>

          <tr v-if="inventoryStore.loading">
            <td colspan="13" class="px-5 py-4 text-center text-gray-500">
              Loading inventory records...
            </td>
          </tr>
          <tr v-else-if="!inventoryStore.loading && !items.length">
            <td colspan="13" class="px-5 py-4 text-center text-gray-500">
              No inventory records found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
