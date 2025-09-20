<script setup lang="ts">
import { useStore } from '@/stores/stores'

const storeStore = useStore()
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
            v-for="(store, index) in storeStore.stores"
            :key="store.id"
          >
            <!-- Index -->
            <td class="px-5 py-4">{{ index + 1 }}</td>

            <!-- Name -->
            <td class="px-5 py-4 whitespace-nowrap">{{ store.name }}</td>

            <!-- Description -->
            <td class="px-5 py-4 whitespace-nowrap">{{ store.description }}</td>

            <!-- Actions -->
            <td class="px-5 py-4">
              <div class="flex gap-2">
                <button
                  @click="storeStore.openModal('view', store)"
                  class="p-1 rounded hover:bg-gray-100"
                  title="View"
                >
                  👁
                </button>
                <button
                  @click="storeStore.openModal('edit', store)"
                  class="p-1 rounded hover:bg-gray-100"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  @click="storeStore.openModal('delete', store)"
                  class="p-1 rounded hover:bg-gray-100 text-red-600"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </td>
          </tr>

          <!-- Loading / Empty State -->
          <tr v-if="storeStore.loading">
            <td colspan="6" class="px-5 py-4 text-center text-gray-500">
              Loading stores...
            </td>
          </tr>
          <tr v-else-if="!storeStore.loading && !storeStore.stores?.length">
            <td colspan="6" class="px-5 py-4 text-center text-gray-500">
              No store found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
