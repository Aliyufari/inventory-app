<script setup lang="ts">
import { useProduct } from '@/stores/products'
import { Eye, Pencil, Trash2, Package } from 'lucide-vue-next'
import Input from '@/components/ui/input/Input.vue'
import Select from '@/components/ui/select/Select.vue'
import Pagination from '../components/Pagination.vue'

const productStore = useProduct()

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
]

const money = (value: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(value)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <!-- Select Filters -->
      <div class="flex gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
        <Select
          :model-value="productStore.category"
          @update:modelValue="productStore.updateFilter('category', $event)"
          :options="productStore.categoryOptions"
          placeholder="All Categories"
          class="w-full  md:w-52 h-10"
        />
        <Select
          :model-value="productStore.status"
          @update:modelValue="productStore.updateFilter('status', $event)"
          :options="statusOptions"
          placeholder="All Statuses"
          class="w-full  md:w-44 h-10"
        />
      </div>
      
      <!-- Search Input -->
      <div class="relative w-full sm:w-full md:w-80">
        <Input
          :model-value="productStore.search"
          @update:modelValue="productStore.updateFilter('search', $event)"
          placeholder="Search products..."
          class="w-full h-10 pl-4 pr-4 rounded-lg border border-gray-200 text-sm bg-white
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                transition-all placeholder:text-gray-400"
        />
      </div>
    </div>

    <!-- TABLE (UNCHANGED) -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full table-auto whitespace-nowrap">
          <thead>
            <tr
              class="bg-gray-50 border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider"
            >
              <th class="px-6 py-4 text-left">Product</th>
              <th class="px-6 py-4 text-left">Categories</th>
              <th class="px-6 py-4 text-left">Cost</th>
              <th class="px-6 py-4 text-left">Wholesale</th>
              <th class="px-6 py-4 text-left">Retail</th>
              <th class="px-6 py-4 text-left">Store</th>
              <th class="px-6 py-4 text-left">Created By</th>
              <th class="px-6 py-4 text-left">Updated By</th>
              <th class="px-6 py-4 text-left">Created At</th>
              <th class="px-6 py-4 text-left">Updated At</th>
              <th class="px-6 py-4 text-left">Status</th>
              <th class="px-6 py-4 text-right"></th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="product in productStore.products"
              :key="product.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4">
                <div class="flex items-center gap-4 max-w-[26rem]">
                  <!-- Product Image -->
                  <div
                    class="w-12 h-12 rounded-xl bg-gray-100 flex items-center
                          justify-center overflow-hidden flex-shrink-0 border"
                  >
                    <img
                      v-if="product.image"
                      :src="product.image"
                      :alt="product.name"
                      class="w-full h-full object-cover"
                    />
                    <Package v-else class="w-5 h-5 text-gray-400" />
                  </div>

                  <!-- Product Info -->
                  <div class="min-w-0 space-y-0.5">
                    <!-- Name -->
                    <p class="font-semibold text-gray-900 truncate">
                      {{ product.name }}
                    </p>

                    <!-- Brand -->
                    <p
                      v-if="product.brand"
                      class="text-xs text-gray-500 truncate"
                    >
                      {{ product.brand }}
                    </p>

                    <!-- Barcode -->
                    <!-- <p
                      v-if="product.barcode"
                      class="text-[11px] text-gray-400 font-mono tracking-wide"
                    >
                      {{ product.barcode }}
                    </p> -->
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1 max-w-[16rem]">
                  <!-- Category chips -->
                  <span
                    v-for="(category, index) in product.categories.slice(0, 2)"
                    :key="category.id ?? index"
                    class="px-2 py-0.5 text-xs font-medium
                          rounded-full bg-blue-50 text-blue-700
                          border border-indigo-100"
                  >
                    {{ category.name }}
                  </span>

                  <!-- Overflow indicator -->
                  <span
                    v-if="product.categories.length > 2"
                    class="px-2 py-0.5 text-xs font-medium
                          rounded-full bg-gray-100 text-gray-600"
                    :title="product.categories.map(c => c.name).join(', ')"
                  >
                    +{{ product.categories.length - 2 }}
                  </span>

                  <!-- Empty state -->
                  <span
                    v-if="!product.categories || product.categories.length === 0"
                    class="text-sm text-gray-400"
                  >
                    —
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 font-semibold">{{ money(product.cost) }}</td>
              <td class="px-6 py-4">{{ money(product.wholesale_price) }}</td>
              <td class="px-6 py-4">{{ money(product.retail_price) }}</td>
              <td class="px-6 py-4">{{ product.store.name || 'N/A' }}</td>
              <td class="px-6 py-4">{{ product.created_by?.name || 'N/A' }}</td>
              <td class="px-6 py-4">{{ product.updated_by?.name || 'N/A' }}</td>
              <td class="px-6 py-4">{{ product.created_at || 'N/A' }}</td>
              <td class="px-6 py-4">{{ product.updated_at || 'N/A' }}</td>

              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full
                         text-xs font-semibold ring-1"
                  :class="
                    product.status
                      ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                      : 'bg-red-100 text-red-700 ring-red-200'
                  "
                >
                  {{ product.status ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <td class="px-6 py-4">
                <div class="flex justify-end gap-1">
                  <button
                    @click="productStore.openView(product)"
                    class="p-2 rounded-lg hover:bg-orange-100 text-orange-400 hover:text-orange-600 cursor-pointer"
                  >
                    <Eye class="w-4 h-4" />
                  </button>

                  <button
                    @click="productStore.openEdit(product)"
                    class="p-2 rounded-lg hover:bg-green-100 text-green-500 hover:text-green-600 cursor-pointer"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>

                  <button
                    @click="productStore.openDelete(product)"
                    class="p-2 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 cursor-pointer"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!productStore.products.length">
              <td colspan="14" class="py-16 text-center">
                <Package class="mx-auto h-12 w-12 text-gray-300" />
                <p class="mt-2 text-gray-500 font-medium">No products found</p>
                <p class="text-sm text-gray-400">Try adjusting your filters</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- PAGINATION -->
    <section class="flex justify-center md:justify-end mb-6">
      <Pagination
        v-if="productStore.totalPages > 1"
        :links="productStore.paginationLinks"
        :current-page="productStore.currentPage"
        :total-pages="productStore.totalPages"
        @change="productStore.changePage"
      />
    </section>
  </div>
</template>
