<script setup lang="ts">
import { useCategory } from '@/stores/categories'
import { computed } from 'vue';

const categoryStore = useCategory()
console.log("Error " + categoryStore.categories);

</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="px-5 py-3 text-left whitespace-nowrap">#</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Name</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Description</th>
            <th class="px-5 py-3 text-left whitespace-nowrap"></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="(category, index) in categoryStore.categories"
            :key="category.id"
          >
            <!-- Index -->
            <td class="px-5 py-4">{{ index + 1 }}</td>

            <!-- Name -->
            <td class="px-5 py-4 whitespace-nowrap">{{ category.name }}</td>

            <!-- Description -->
            <td class="px-5 py-4 whitespace-nowrap">{{ category.description }}</td>

            <!-- Actions -->
            <td class="px-5 py-4">
              <div class="flex gap-2">
                <button
                  @click="categoryStore.openModal('view', category)"
                  class="p-1 rounded hover:bg-gray-100"
                  title="View"
                >
                  👁
                </button>
                <button
                  @click="categoryStore.openModal('edit', category)"
                  class="p-1 rounded hover:bg-gray-100"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  @click="categoryStore.openModal('delete', category)"
                  class="p-1 rounded hover:bg-gray-100 text-red-600"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </td>
          </tr>

          <!-- Loading / Empty State -->
          <tr v-if="categoryStore.loading">
            <td colspan="6" class="px-5 py-4 text-center text-gray-500">
              Loading categories...
            </td>
          </tr>
          <tr v-else-if="!categoryStore.loading && !categoryStore.categories?.length">
            <td colspan="6" class="px-5 py-4 text-center text-gray-500">
              No category found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
