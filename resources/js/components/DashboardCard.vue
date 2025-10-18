<script setup lang="ts">
import { ChevronsRight, type LucideIcon } from 'lucide-vue-next'
import { Link } from '@inertiajs/vue3'
import { computed } from 'vue'

interface Props {
  value?: string | number
  link: string
  description?: string
  footerText?: string
  icon?: LucideIcon
  iconBgColor?: string
  iconColor?: string
  borderColor?: string
  footerBgColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  link: '',
  description: '',
  footerText: 'View Details',
  iconBgColor: '#FEF9C3',
  iconColor: '#FACC15',
  borderColor: '#FEF08A',
  footerBgColor: ''
})

const footerBackground = computed(() => props.footerBgColor || props.iconColor)
</script>

<template>
  <div class="rounded-2xl border overflow-hidden bg-white dark:bg-sidebar">
    <div class="flex items-center justify-between gap-4 p-6">
      <div class="flex items-center justify-center rounded-full w-14 h-14" :style="{ backgroundColor: iconBgColor }">
        <component :is="icon" class="w-8 h-8" :style="{ color: iconColor }" />
      </div>

      <div class="flex flex-col items-center justify-center gap-1 flex-1">
        <h4 class="font-bold text-gray-800 dark:text-white/90 text-2xl">{{ value }}</h4>
        <span class="text-sm text-gray-600 dark:text-gray-400">{{ description }}</span>
      </div>
    </div>

    <Link
      :href="link"
      class="flex gap-2 justify-center items-center p-3 text-white hover:brightness-95 transition-all"
      :style="{ backgroundColor: iconColor }"
    >
      <p>{{ footerText }}</p>
      <ChevronsRight class="w-5 h-5" />
    </Link>
  </div>
</template>
