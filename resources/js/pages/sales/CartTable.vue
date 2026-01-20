<script setup lang="ts">
import { computed } from 'vue'
import Input from '@/components/ui/input/Input.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue';
import { Trash2 } from 'lucide-vue-next'

const props = defineProps<{
  items: any[]
  discount: number
  taxRate: number
  note: string
}>()

const emit = defineEmits([
  'increase',
  'decrease',
  'remove',
  'update:discount',
  'update:taxRate',
  'update:note',
  'updateQty',
  'updateItemDiscount',
])

// Reverse the items array to show newest items first
const reversedItems = computed(() => [...props.items].reverse())
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden sticky top-6">
    <div class="overflow-x-auto">
      <table class="w-full text-sm table-fixed min-w-[700px]">
        <!-- Header -->
        <thead class="border-b bg-gray-50/50 py-4">
          <tr class="text-gray-600">
            <th class="px-4 py-3 text-left font-medium w-10">#</th>
            <th class="px-4 py-3 text-left font-medium w-[260px]">Product</th>
            <th class="px-4 py-3 text-center font-medium w-36">Quantity</th>
            <th class="px-4 py-3 text-left font-medium w-24">Price</th>
            <th class="px-4 py-3 text-left font-medium w-28">Discount</th>
            <th class="px-4 py-3 text-left font-medium w-28">Total</th>
            <th class="w-14"></th>
          </tr>
        </thead>

        <tbody>
          <!-- Empty state -->
          <tr v-if="!items.length">
            <td colspan="7" class="py-16 text-center text-gray-400">
              No items scanned yet
            </td>
          </tr>

          <!-- Items - Reversed Order (Newest First) -->
          <tr
            v-for="(item, index) in reversedItems"
            :key="item.id"
            class="border-b last:border-b-0 hover:bg-gray-50 transition"
          >
            <!-- Index - Show descending numbers -->
            <td class="px-4 py-3 text-gray-700">{{ items.length - index }}</td>

            <!-- Product -->
            <td class="px-4 py-3">
              <div class="font-medium text-gray-800 truncate leading-tight">
                {{ item.name }}
              </div>
              <div class="text-xs text-gray-400 truncate">{{ item.barcode }}</div>
            </td>

            <!-- Quantity -->
            <td class="px-4 py-3">
              <div class="flex items-center justify-center gap-2">
                <button
                  @click="emit('decrease', item.id)"
                  class="w-7 h-7 border bg-red-50 rounded text-gray-600 hover:bg-red-100 transition"
                >
                  −
                </button>
                <Input
                  min="1"
                  class="w-16 text-center font-medium"
                  :model-value="item.qty"
                  @update:model-value="
                    emit('updateQty', item.id, Math.max(1, Number($event) || 1))
                  "
                />
                <button
                  @click="emit('increase', item.id)"
                  class="w-7 h-7 border bg-green-50 rounded text-gray-600 hover:bg-green-100 transition"
                >
                  +
                </button>
              </div>
            </td>

            <!-- Price -->
            <td class="px-4 py-3 text-left text-gray-700">₦{{ item.price.toFixed(2) }}</td>

            <!-- Item Discount -->
            <td class="px-4 py-3 text-left">
              <Input
                min="0"
                inputmode="decimal"
                class="w-24 text-left"
                :model-value="item.discount"
                @update:model-value="
                  emit('updateItemDiscount', item.id, Math.max(0, Number($event) || 0))
                "
              />
            </td>

            <!-- Total -->
            <td class="px-4 py-3 text-left font-semibold text-gray-800">
              ₦{{ ((item.price * item.qty) - (item.discount || 0)).toFixed(2) }}
            </td>

            <!-- Remove -->
            <td class="px-3 text-center">
              <button
                @click="emit('remove', item.id)"
                class="text-red-500 hover:text-red-600 transition"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>

          <!-- Summary: Note, Discount, Tax -->
          <tr v-if="items.length">
            <td colspan="7" class="bg-gray-50 px-4 py-5">
              <div class="flex flex-col-reverse sm:flex-row sm:items-end sm:justify-between gap-8">
                <!-- Note -->
                <div class="flex-1">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Note</label>
                  <Textarea
                    type="text"
                    placeholder="Optional note…"
                    :value="note"
                    @input="emit('update:note', ($event.target as HTMLInputElement).value)"
                  />
                </div>

                <!-- Discount + Tax -->
                <div class="flex flex-col gap-4">
                  <!-- Discount -->
                  <div class="flex-1 flex items-center gap-2 justify-end">
                    <label class="text-sm font-medium text-gray-700">Discount (₦)</label>
                    <Input
                      type="text"
                      inputmode="decimal"
                      class="w-32 text-right"
                      :model-value="discount"
                      @update:model-value="
                        emit('update:discount', Math.max(0, Number($event) || 0))
                      "
                    />
                  </div>

                  <!-- Tax Rate -->
                  <div class="flex-1 flex items-center gap-2 justify-end">
                    <label class="text-sm font-medium text-gray-700">Tax (%)</label>
                    <Input
                      min="0"
                      max="100"
                      step="0.1"
                      class="w-32 text-right"
                      :model-value="taxRate * 100"
                      @update:model-value="
                        emit('update:taxRate', Math.max(0, Number($event) || 0) / 100)
                      "
                    />
                  </div>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>