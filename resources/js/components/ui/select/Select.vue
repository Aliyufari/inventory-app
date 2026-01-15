<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { cn } from "@/lib/utils"
import { useVModel } from "@vueuse/core"
import { ChevronDown } from "lucide-vue-next"

const props = withDefaults(defineProps<{
  defaultValue?: string | number | boolean | null
  modelValue?: string | number | boolean | null
  class?: HTMLAttributes["class"]
  options?: { label: string; value: string | number }[]
  placeholder: string
  id?: string | number
  disabled?: boolean
}>(), {
  options: () => [],
  disabled: false,
})

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <div class="relative w-full">
    <select
      v-model="modelValue"
      data-slot="select"
      :id="id"
      :disabled="disabled"
      :aria-label="placeholder"
      :class="cn(
        'flex h-10 w-full appearance-none rounded-lg border bg-white px-3 py-0 pr-10 text-sm shadow-sm transition-all outline-none',
        'border-gray-200 text-gray-900 placeholder:text-gray-400',
        'hover:border-gray-300',
        'focus:border-primary focus:ring-2 focus:ring-blue-500/20',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
        'dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:hover:border-gray-600',
        'dark:focus:border-primary dark:focus:ring-blue-400/20',
        props.class,
      )"
    >
      <option disabled value="" hidden>
        {{ placeholder }}
      </option>
      <option
        v-for="opt in props.options"
        :key="opt.value"
        :value="opt.value"
        class="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        {{ opt.label }}
      </option>
    </select>
    
    <ChevronDown 
      class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-colors"
      :class="{ 'opacity-50': disabled }"
    />
  </div>
</template>