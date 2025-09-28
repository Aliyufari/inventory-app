<script setup lang="ts">
import { ref, computed, watch } from "vue"

const props = defineProps<{
  modelValue?: string | number
  options: { label: string; value: string | number }[]
  placeholder?: string
  class?: string
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const search = ref("")
const open = ref(false)

// Keep input text in sync when modelValue changes externally
watch(
  () => props.modelValue,
  (newVal) => {
    const selected = props.options.find(opt => opt.value === newVal)
    if (selected) {
      search.value = selected.label
    }
  },
  { immediate: true }
)

const filteredOptions = computed(() => {
  if (!search.value) return props.options
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(search.value.toLowerCase())
  )
})

const selectOption = (opt: { label: string; value: string | number }) => {
  emits("update:modelValue", opt.value)
  search.value = opt.label
  open.value = false
}
</script>

<template>
  <div class="relative w-full">
    <!-- Search input -->
    <input
      v-model="search"
      type="text"
      :placeholder="placeholder"
      @focus="open = true"
      class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
    />

    <!-- Dropdown -->
    <ul
      v-if="open && filteredOptions.length"
      class="absolute z-[999] mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg"
    >
      <li
        v-for="opt in filteredOptions"
        :key="opt.value"
        @click="selectOption(opt)"
        class="cursor-pointer px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
      >
        {{ opt.label }}
      </li>
    </ul>

    <!-- No results -->
    <div
      v-if="open && !filteredOptions.length"
      class="absolute z-50 mt-1 w-full rounded-md border bg-background p-2 text-sm text-muted-foreground"
    >
      No results found
    </div>
  </div>
</template>
