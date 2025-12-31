<script setup lang="ts">
import { computed } from 'vue'
import type { LucideIcon } from 'lucide-vue-next'

interface Props {
  value?: string | number
  description: string
  icon?: LucideIcon
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  color: 'bg-gray-100'
})
</script>

<template>
  <div
    class="flex flex-col justify-center rounded-xl shadow-md border border-gray-100 dark:border-gray-700 p-6 bg-white dark:bg-gray-900"
  >
    <div class="flex items-center gap-4">
      <div :class="['p-3 rounded-lg', props.color]">
        <component :is="props.icon" class="w-8 h-8 text-white" />
      </div>
      <div class="flex flex-col">
        <span class="text-gray-500 dark:text-gray-400 text-sm font-medium">
          {{ props.description }}
        </span>
        <span class="text-2xl font-semibold text-gray-900 dark:text-white">
          {{ props.value }}
        </span>
      </div>
    </div>
  </div>
</template>
