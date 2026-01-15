<script setup lang="ts">
import { ref, watch } from "vue"
import axios from "axios"
import { Search } from "lucide-vue-next"
import { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  placeholder?: string
  id?: string
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const search = ref("")
const suggestions = ref<{ label: string; value: number | string }[]>([])
let timeout: any = null

watch(
  () => props.modelValue,
  (val) => {
    if (!val) search.value = ""
  }
)

watch(search, (val) => {
  clearTimeout(timeout)

  if (!val) {
    suggestions.value = []
    return
  }

  timeout = setTimeout(async () => {
    try {
      const { data } = await axios.get(route("products.search"), {
        params: { query: val },
      })

      suggestions.value = data.products.map((item: any) => ({
        label: item.name,
        value: item.id,
      }))
    } catch (e) {
      console.error("Search failed", e)
    }
  }, 250)
})

function select(value: string) {
  const match = suggestions.value.find(s => s.label === value)
  if (match) {
    emit("update:modelValue", match.value)
    search.value = match.label
  }
}
</script>

<template>
  <!-- POS aligned container -->
    <div class="relative flex items-center">

      <!-- Search icon -->
      <Search class="absolute left-8 h-5 w-5 text-gray-400" />

      <!-- Input -->
      <input
        v-model="search"
        :list="props.id"
        type="text"
        :placeholder="placeholder || 'Search products by name or scan barcode...'"
        :class="cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          props.class,
        )"
        @input="select(search)"
      />

      <!-- Suggestions -->
      <datalist :id="props.id">
        <option
          v-for="opt in suggestions"
          :key="opt.value"
          :value="opt.label"
        />
      </datalist>
    </div>
</template>
