<script setup lang="ts">
import { ref, computed, watch } from "vue"

const props = defineProps<{
  modelValue?: string | number
  options: { label: string; value: string | number; categories?: string[] }[]
  placeholder?: string
  class?: string
  filter?: (query: string) => any[] // Changed: filter function now returns filtered array
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const search = ref("")
const open = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

// Watch modelValue → update visible search box text
watch(
  () => props.modelValue,
  (newVal) => {
    const selected = props.options.find(opt => opt.value === newVal)
    if (selected) {
      search.value = selected.label
    } else if (typeof newVal === "string" && newVal.trim() !== "") {
      // if user typed new name manually (no match in options)
      search.value = newVal
    }
  },
  { immediate: true }
)

// Filter options - FIXED: Use the filter function if provided, otherwise use local filtering
const filteredOptions = computed(() => {
  if (props.filter) {
    // If parent provides a filter function, use it
    return props.filter(search.value)
  }
  
  // Otherwise do local filtering
  if (!search.value) return props.options
  
  const searchLower = search.value.toLowerCase()
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(searchLower) ||
    (opt.categories?.some(cat =>
      cat.toLowerCase().includes(searchLower)
    ))
  )
})

// --- Handle input typing ---
const handleInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  search.value = val
  emits("update:modelValue", val)
}

// --- Handle option selection ---
const selectOption = (opt: { label: string; value: string | number }) => {
  emits("update:modelValue", opt.value)
  search.value = opt.label
  open.value = false
}

// --- Handle focus/blur ---
const handleBlur = (event: FocusEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.relatedTarget as Node)) {
    open.value = false
  }
}

const handleFocus = () => { 
  open.value = true 
  // When focusing, show all options if no search term
  if (!search.value && props.filter) {
    props.filter("")
  }
}
</script>

<template>
  <div
    class="relative w-full"
    @focusout="handleBlur"
    tabindex="-1"
    ref="wrapperRef"
  >
    <input
      :value="search"
      type="text"
      :placeholder="placeholder"
      class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
      @input="handleInput"
      @focus="handleFocus"
      @keydown.esc="open = false"
    />

    <ul
      v-if="open && filteredOptions.length"
      class="absolute z-[999] mt-1 max-h-35 w-full overflow-auto rounded-md border bg-background shadow-lg"
    >
      <li
        v-for="opt in filteredOptions"
        :key="opt.value"
        @mousedown.prevent
        @click="selectOption(opt)"
        class="cursor-pointer px-3 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
      >
        {{ opt.label }}
        <span v-if="opt.categories?.length" class="text-xs text-gray-500 ml-2">
          ({{ opt.categories.join(', ') }})
        </span>
      </li>
    </ul>

    <div
      v-if="open && !filteredOptions.length"
      class="absolute z-50 mt-1 w-full rounded-md border bg-background p-2 text-sm text-muted-foreground"
    >
      No results found
    </div>
  </div>
</template>