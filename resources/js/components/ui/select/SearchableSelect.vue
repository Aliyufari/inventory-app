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

  return props.options.filter(opt => {
    if (props.filter) {
      return props.filter(opt, opt.label, search.value)
    }
    return (
      opt.label.toLowerCase().includes(search.value.toLowerCase()) ||
      (opt.categories?.some(cat =>
        cat.toLowerCase().includes(search.value.toLowerCase())
      ))
    )
  })
})

const selectOption = (opt: { label: string; value: string | number }) => {
  emits("update:modelValue", opt.value)
  search.value = opt.label
  open.value = false
}
</script>

<template>
  <!-- wrapper to handle blur correctly -->
  <div
    class="relative w-full"
    @focusin="open = true"
    @focusout="open = false"
    tabindex="0"
  >
    <input
      v-model="search"
      type="text"
      :placeholder="placeholder"
      class="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
    />

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
