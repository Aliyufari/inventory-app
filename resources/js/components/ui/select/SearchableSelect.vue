<script setup lang="ts">
import { ref, computed, watch } from "vue"

const props = defineProps<{
  modelValue?: string | number
  options: { label: string; value: string | number; categories?: string[] }[]
  placeholder?: string
  class?: string
  filter?: (opt: any, label: string, search: string) => boolean
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const search = ref("")
const open = ref(false)

// Refs for robust focus management
const wrapperRef = ref<HTMLElement | null>(null)

// --- Watchers ---

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

// --- Computed Properties ---

const filteredOptions = computed(() => {
  if (!search.value) return props.options

  return props.options.filter(opt => {
    if (props.filter) {
      return props.filter(opt, opt.label, search.value)
    }
    // Default filtering logic (case-insensitive on label and categories)
    return (
      opt.label.toLowerCase().includes(search.value.toLowerCase()) ||
      (opt.categories?.some(cat =>
        cat.toLowerCase().includes(search.value.toLowerCase())
      ))
    )
  })
})

// --- Methods ---

const selectOption = (opt: { label: string; value: string | number }) => {
  emits("update:modelValue", opt.value)
  search.value = opt.label
  open.value = false
  // Note: We avoid re-focusing the input here to prevent the "auto-focus" sensation.
}

/**
 * Robust handler to close the dropdown only if focus leaves the entire component.
 * This is crucial for accessibility and preventing premature closing.
 */
const handleBlur = (event: FocusEvent) => {
  // Check if the element receiving focus (relatedTarget) is outside the component wrapper.
  if (wrapperRef.value && !wrapperRef.value.contains(event.relatedTarget as Node)) {
    open.value = false
  }
}

// Ensure the dropdown opens when the input receives focus
const handleFocus = () => {
  open.value = true
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
      v-model="search"
      type="text"
      :placeholder="placeholder"
      class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
      @focus="handleFocus"
      @keydown.esc="open = false"
    />

    <ul
      v-if="open && filteredOptions.length"
      class="absolute z-[999] mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg"
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
          ({{ opt.categories.join(", ") }})
        </span>
        <span v-if="opt.units_per_packet || opt.packets_per_carton" class="text-xs text-gray-400 ml-2">
          • {{ opt.units_per_packet }} units/packet, {{ opt.packets_per_carton }} packets/carton
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