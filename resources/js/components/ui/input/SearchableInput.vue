<script setup lang="ts">
import { ref, watch } from "vue"
import axios from "axios"

const props = defineProps<{
  modelValue?: string | number
  placeholder?: string
  id?: string
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const search = ref("")
const suggestions = ref<{ label: string; value: string }[]>([])

// watch typing and fetch suggestions
watch(search, async (val) => {
  if (!val) {
    suggestions.value = []
    return
  }
  try {
    const { data } = await axios.get(route("customers.search"), { params: { query: val } }) // <-- match backend "q"
    suggestions.value = data.customers.map((customer: any) => ({
      label: customer.name,
      value: customer.id,
    }))
  } catch (err) {
    console.error("Customer search failed", err)
  }
})

const select = (label: string) => {
  const match = suggestions.value.find(s => s.label === label)
  if (match) {
    emits("update:modelValue", match.label) // <-- emit id not name
  }
}
</script>

<template>
  <div class="relative w-full">
    <input
      v-model="search"
      type="text"
      :list="props.id"
      :placeholder="placeholder"
      class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
      @change="select(search)" 
    />

    <datalist :id="props.id">
      <option
        v-for="opt in suggestions"
        :key="opt.value"
        :value="opt.label"
      />
    </datalist>
  </div>
</template>
