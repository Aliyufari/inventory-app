<script setup lang="ts">
import { useProduct } from '@/stores/products'

const productStore = useProduct()
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full text-sm">
        <!-- Table Header -->
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="px-5 py-3 text-left whitespace-nowrap">#</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Name</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Brand</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Category(es)</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Store</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Quantity</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Description</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Actions</th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-gray-200">
          <tr v-for="(product, index) in productStore.products" :key="product.id">
            <!-- Index -->
            <td class="px-5 py-4">{{ index + 1 }}</td>

            <!-- Name -->
            <td class="px-5 py-4 whitespace-nowrap">{{ product.name }}</td>

            <!-- Brand -->
            <td class="px-5 py-4 whitespace-nowrap">{{ product.brand }}</td>

            <!-- Categories -->
            <td class="px-5 py-4 whitespace-nowrap">
              <span v-if="product.categories?.length">
                {{ product.categories.map(c => c.name).join(', ') }}
              </span>
              <span v-else class="text-gray-400">—</span>
            </td>

            <!-- Store -->
            <td class="px-5 py-4 whitespace-nowrap">{{ product.store?.name || '—' }}</td>

            <!-- Quantity -->
            <td class="px-5 py-4 whitespace-nowrap">{{ product.quantity }}</td>

            <!-- Description -->
            <td class="px-5 py-4 whitespace-nowrap">{{ product.description || '—' }}</td>

            <!-- Actions -->
            <td class="px-5 py-4">
              <div class="flex gap-2">
                <button
                  @click="productStore.openModal('view', product)"
                  class="p-1 rounded hover:bg-gray-100"
                  title="View"
                >
                  👁
                </button>
                <button
                  @click="productStore.openModal('edit', product)"
                  class="p-1 rounded hover:bg-gray-100"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  @click="productStore.openModal('delete', product)"
                  class="p-1 rounded hover:bg-gray-100 text-red-600"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </td>
          </tr>

          <!-- Loading State -->
          <tr v-if="productStore.loading">
            <td colspan="8" class="px-5 py-4 text-center text-gray-500">
              Loading products...
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="!productStore.loading && !productStore.products?.length">
            <td colspan="8" class="px-5 py-4 text-center text-gray-500">
              No products found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
