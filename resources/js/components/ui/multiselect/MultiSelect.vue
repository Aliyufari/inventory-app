<script setup lang="ts">
import { ref, watch, type HTMLAttributes } from "vue";
import { onClickOutside } from "@vueuse/core";

const props = defineProps<{
  options: { label: string; value: string | number }[];
  modelValue?: (string | number)[];
  placeholder?: string;
  class?: HTMLAttributes["class"];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: (string | number)[]): void;
}>();

const isOpen = ref(false);
const selected = ref<(string | number)[]>(props.modelValue ?? []);
const wrapper = ref<HTMLElement | null>(null);

const toggleDropdown = () => (isOpen.value = !isOpen.value);

const toggleItem = (val: string | number) => {
  if (selected.value.includes(val)) {
    selected.value = selected.value.filter((v) => v !== val);
  } else {
    selected.value.push(val);
  }
  emit("update:modelValue", selected.value);
};

const removeItem = (val: string | number) => {
  selected.value = selected.value.filter((v) => v !== val);
  emit("update:modelValue", selected.value);
};

const isSelected = (val: string | number) => selected.value.includes(val);

onClickOutside(wrapper, () => (isOpen.value = false));

watch(
  () => props.modelValue,
  (val) => (selected.value = val ?? [])
);
</script>

<template>
  <div ref="wrapper" class="relative w-full" :class="props.class">
    <!-- Input box -->
    <div
      @click="toggleDropdown"
      class="flex h-9 min-w-0 cursor-pointer items-center rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
    >
      <!-- Placeholder -->
      <span v-if="selected.length === 0" class="text-muted-foreground">
        {{ props.placeholder ?? "Select..." }}
      </span>

      <!-- Selected tags -->
      <div v-else class="flex flex-wrap items-center gap-2 flex-1">
        <span
          v-for="opt in props.options.filter(o => selected.includes(o.value))"
          :key="opt.value"
          class="group flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs text-gray-800"
        >
          {{ opt.label }}
          <button
            type="button"
            @click.stop="removeItem(opt.value)"
            class="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </span>
      </div>

      <!-- Chevron -->
      <svg
        class="ml-auto h-4 w-4 text-muted-foreground transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="absolute z-10 mt-1 w-full rounded-md border border-input bg-white shadow-lg dark:bg-gray-800"
    >
      <ul class="max-h-60 overflow-y-auto divide-y divide-gray-100">
        <li
          v-for="opt in props.options"
          :key="opt.value"
          @click="toggleItem(opt.value)"
          class="flex cursor-pointer items-center px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700"
          :class="{ 'bg-gray-50 dark:bg-gray-700': isSelected(opt.value) }"
        >
          <span class="flex-1 text-sm">{{ opt.label }}</span>
          <svg
            v-if="isSelected(opt.value)"
            class="h-4 w-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </li>
      </ul>
    </div>
  </div>
</template>
