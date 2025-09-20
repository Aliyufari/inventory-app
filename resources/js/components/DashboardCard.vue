<script setup lang="ts">
import { ChevronsRight, type LucideIcon } from 'lucide-vue-next';
import { Link } from '@inertiajs/vue3';
import CardFooter from './ui/card/CardFooter.vue';
import { computed } from 'vue';

interface Props {
  value?: string | number;
  description?: string;
  footerText?: string;
  icon?: LucideIcon;
  iconBgColor?: string;    // Hex color
  iconColor?: string;      // Hex color
  borderColor?: string;    // Hex color
  footerBgColor?: string;  // Optional override
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  description: '',
  footerText: 'View Details',
  iconBgColor: '#FEF9C3',  // yellow-100 equivalent
  iconColor: '#FACC15',    // yellow-400 equivalent
  borderColor: '#FEF08A',  // yellow-200 equivalent
  footerBgColor: ''        // Will auto-set to iconColor
});

// Compute footer background (uses iconColor by default)
const footerBackground = computed(() => {
  return props.footerBgColor || props.iconColor;
});
</script>

<template>
  <div 
    class="rounded-2xl border overflow-hidden bg-white dark:bg-sidebar"
  >
    <div class="flex items-center justify-between gap-4 p-6">
      <!-- Icon -->
      <div 
        class="flex items-center justify-center rounded-full w-14 h-14"
        :style="{ backgroundColor: iconBgColor }"
      >
        <component 
          :is="icon" 
          class="w-8 h-8"
          :style="{ color: iconColor }"
        />
      </div>

      <!-- Content -->
      <div class="flex flex-col items-center justify-center gap-1 flex-1">
        <h4 class="font-bold text-gray-800 dark:text-white/90 text-2xl">
          {{ value }}
        </h4>
        <span class="text-sm text-gray-600 dark:text-gray-400">
          {{ description }}
        </span>
      </div>
    </div>

    <!-- Footer -->
    <Link 
      :href="''"
      class="flex gap-2 justify-center items-center p-3 text-white hover:brightness-95 transition-all"
      :style="{ backgroundColor: iconColor }"
    >
      <p>{{ footerText }}</p>
      <ChevronsRight class="w-5 h-5" />
    </Link>
  </div>
</template>