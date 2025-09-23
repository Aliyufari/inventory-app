<script setup lang="ts">
import { computed } from "vue"
import { useInventory } from "@/stores/inventory"
import type { Ref } from "vue"

const inventoryStore = useInventory()
const items = computed(() => (Array.isArray(inventoryStore.inventories) ? inventoryStore.inventories : inventoryStore.inventories?.value ?? []))

// helpers
const formatCurrency = (v: number) => new Intl.NumberFormat(undefined, { style: "currency", currency: "NGN" }).format(v)
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="px-4 py-3 text-left">Invoice</th>
            <th class="px-4 py-3 text-left">Date</th>
            <th class="px-4 py-3 text-left">Customer</th>
            <th class="px-4 py-3 text-left">Items</th>
            <th class="px-4 py-3 text-right">Total</th>
            <th class="px-4 py-3 text-right">Discount</th>
            <th class="px-4 py-3 text-right">Grand Total</th>
            <th class="px-4 py-3 text-left"></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200">
          <tr v-for="inv in items" :key="inv.id">
            <td class="px-4 py-3">{{ inv.invoice_no ?? inv.id }}</td>
            <td class="px-4 py-3">{{ inv.date ?? inv.created_at }}</td>
            <td class="px-4 py-3">{{ inv.customer_name ?? 'Walk-in' }}</td>
            <td class="px-4 py-3">{{ inv.items?.length ?? inv.total_items ?? '—' }}</td>
            <td class="px-4 py-3 text-right">{{ formatCurrency(inv.total ?? inv.subtotal ?? 0) }}</td>
            <td class="px-4 py-3 text-right">{{ formatCurrency(inv.discount ?? 0) }}</td>
            <td class="px-4 py-3 text-right font-semibold">{{ formatCurrency(inv.grand_total ?? inv.total ?? 0) }}</td>
            <td class="px-4 py-3">
              <div class="flex gap-2">
                <button @click="inventoryStore.openModal('view', inv)" title="View" class="p-1 rounded hover:bg-gray-100">👁</button>
                <button @click="inventoryStore.openModal('edit', inv)" title="Edit" class="p-1 rounded hover:bg-gray-100">✏️</button>
                <button @click="inventoryStore.openModal('delete', inv)" title="Delete" class="p-1 rounded hover:bg-gray-100 text-red-600">🗑</button>
              </div>
            </td>
          </tr>

          <tr v-if="inventoryStore.loading">
            <td colspan="8" class="px-4 py-4 text-center text-gray-500">Loading...</td>
          </tr>
          <tr v-else-if="!inventoryStore.loading && !items.length">
            <td colspan="8" class="px-4 py-4 text-center text-gray-500">No inventory records</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
