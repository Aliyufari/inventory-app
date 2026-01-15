<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePage } from '@inertiajs/vue3';
import Breadcrumbs from '@/components/Breadcrumbs.vue';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItemType } from '@/types';

withDefaults(defineProps<{
    breadcrumbs?: BreadcrumbItemType[];
}>(),{
    breadcrumbs:()=>[]
});

const now = ref(new Date());

let interval: any = null;

onMounted(() => {
  interval = setInterval(() => {
    now.value = new Date()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})

const page = usePage()

const userName = computed(() => {
  return page.props.auth?.user?.name ?? 'User'
})

const currentTime = computed(() => {
  return now.value.toLocaleTimeString()
})

const formattedDate = computed(() => {
  return now.value.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
})

const greeting = computed(() => {
  const hour = now.value.getHours()
  if (hour >= 5 && hour < 12) return 'Good Morning'
  if (hour >= 12 && hour < 17) return 'Good Afternoon'
  return 'Good Evening' 
})
</script>

<template>
    <header
      class="sticky top-0 z-30 bg-white dark:bg-transparent
            flex h-16 shrink-0 items-center justify-between gap-2
            border-b border-sidebar-border/70 px-6 md:px-4 rounded-t-xl"
    >
      <div class="flex items-center gap-2">
        <SidebarTrigger class="-ml-1" />
        <Breadcrumbs
          v-if="breadcrumbs?.length"
          :breadcrumbs="breadcrumbs"
        />
      </div>

      <aside class="flex flex-col items-end space-y-1">
        <h4 class="flex items-center gap-2 font-bold text-sm">
          <span class="w-3 h-3 bg-yellow-400 rounded-full"></span>
          {{ greeting }}, {{ userName }}
        </h4>
        <p class="text-xs ">
          {{ formattedDate }} ·
          <span class="tabular-nums">{{ currentTime }}</span>
        </p>
      </aside>
    </header>
</template>
