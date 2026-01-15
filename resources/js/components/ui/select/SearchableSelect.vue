<script setup lang="ts">
import { Search, X } from "lucide-vue-next";
import { ref, computed, watch, onMounted } from "vue";

const props = defineProps<{
  modelValue?: string | number
  options: { label: string; value: string | number; categories?: string[] }[]
  placeholder?: string
  class?: string
  filter?: (query: string) => any[]
  preselected?: string | number // optional default selection
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number | null): void
}>()

const search = ref("");
const open = ref(false);
const wrapperRef = ref<HTMLElement | null>(null);

// --- Initialize preselected value ---
onMounted(() => {
  if (props.preselected !== undefined) {
    const preOpt = props.options.find(o => o.value === props.preselected);
    if (preOpt) {
      search.value = preOpt.label;
      emits("update:modelValue", preOpt.value);
    }
  }
});

// --- Sync input with modelValue ---
watch(
  () => props.modelValue,
  (newVal) => {
    const selected = props.options.find(opt => opt.value === newVal);
    search.value = selected ? selected.label : (typeof newVal === "string" ? newVal : "");
  },
  { immediate: true }
);

// --- Filtered options ---
const filteredOptions = computed(() => {
  if (props.filter) return props.filter(search.value);
  if (!search.value) return props.options;

  const lower = search.value.toLowerCase();
  return props.options.filter(opt =>
    opt.label.toLowerCase().includes(lower) ||
    (opt.categories?.some(cat => cat.toLowerCase().includes(lower)) ?? false)
  );
});

// --- Handle input ---
const handleInput = (e: Event) => {
  search.value = (e.target as HTMLInputElement).value;
  open.value = true;
  emits("update:modelValue", search.value);
}

// --- Select option ---
const selectOption = (opt: { label: string; value: string | number }) => {
  emits("update:modelValue", opt.value);
  search.value = opt.label;
  open.value = false;
}

// --- Clear selection ---
const clearSelection = () => {
  search.value = "";
  emits("update:modelValue", null);
  open.value = false;
}

// --- Focus / Blur ---
const handleFocus = () => { open.value = true; }
const handleBlur = (e: FocusEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(e.relatedTarget as Node)) {
    open.value = false;
  }
}

// --- Click outside to close dropdown ---
const handleClickOutside = (event: MouseEvent) => {
  if (wrapperRef.value && !wrapperRef.value.contains(event.target as Node)) {
    open.value = false;
  }
}
onMounted(() => document.addEventListener("click", handleClickOutside));
</script>

<template>
  <div class="relative w-full" ref="wrapperRef" tabindex="-1" @focusout="handleBlur">
    <!-- Input with icons -->
    <div class="relative w-full">
      <input
        type="text"
        :value="search"
        :placeholder="placeholder || 'Select...'"
        class="w-full h-10 rounded-md border border-input bg-background px-10 pr-10 text-sm shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
        @input="handleInput"
        @focus="handleFocus"
        @keydown.esc="open = false"
      />

      <!-- Search Icon -->
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />

      <!-- Clear / X Icon -->
      <X
        v-if="search"
        @click="clearSelection"
        class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 h-4 w-4 hover:text-gray-600"
      />
    </div>

    <!-- Dropdown -->
    <ul
      v-if="open"
      class="absolute z-[999] mt-1 max-h-60 w-full overflow-auto rounded-md border bg-background shadow-lg"
    >
      <li
        v-for="opt in filteredOptions"
        :key="opt.value"
        @mousedown.prevent
        @click="selectOption(opt)"
        class="cursor-pointer px-3 py-2 text-sm hover:bg-primary hover:text-white flex justify-between items-center"
      >
        <span>{{ opt.label }}</span>
        <span v-if="opt.categories?.length" class="text-xs text-gray-400 ml-2">
          {{ opt.categories.join(", ") }}
        </span>
      </li>

      <li
        v-if="!filteredOptions.length"
        class="px-3 py-2 text-sm text-gray-500"
      >
        No results found
      </li>
    </ul>
  </div>
</template>
