<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
        class="bg-white dark:bg-transparent flex h-16 shrink-0 justify-between items-center gap-2 border-b border-sidebar-border/70 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4 rounded-t-xl"
    >
        <div class="flex items-center gap-2">
            <SidebarTrigger class="-ml-1" />
            <template v-if="breadcrumbs && breadcrumbs.length > 0">
                <Breadcrumbs :breadcrumbs="breadcrumbs" />
            </template>
        </div>

        <aside class="flex flex-col space-y-1" role="complementary" aria-label="Greeting">
            <h4 class="flex items-center self-end gap-2 font-bold text-sm">
                <span class="block w-3 h-3 bg-yellow-400 dark:bg-yellow-400 rounded-full"></span> 
                {{ greeting }}
            </h4>
            <p class="flex text-xs">{{ formattedDate }} &nbsp; {{ currentTime }}</p>
        </aside>
    </header>
</template>
