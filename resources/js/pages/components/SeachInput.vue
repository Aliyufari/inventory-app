<script setup lang="ts">
import { ref, watch } from 'vue'
import Input from '@/components/ui/input/Input.vue'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
}>()

const search = ref(props.modelValue)

// Keep search input in sync with parent
watch(
  () => props.modelValue,
  (value) => {
    search.value = value
  }
)

// Emit on input change
watch(search, (value) => {
  emit('update:modelValue', value)
  emit('search', value)
})
</script>

<template>
  <div>
    <Input
      id="search"
      type="text"
      v-model="search"
      :placeholder="placeholder || 'Search...'"
      class="w-full md:w-64 border-primary-300"
    />
  </div>
</template>
