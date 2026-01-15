<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import logo from '@/assets/images/logo1.png'

defineOptions({
    inheritAttrs: false,
});

interface Props {
    className?: HTMLAttributes['class'];
}

defineProps<Props>();
</script>

<template>
  <div class="relative flex justify-center">
    <!-- Glow -->
    <div
      class="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500 to-cyan-500 blur-xl opacity-50"
    ></div>

    <!-- Logo -->
    <img
      :src="logo"
      alt=""
      class="relative h-8 w-8 rounded-2xl object-cover shadow-lg"
    />
  </div>
</template>

