<script setup lang="ts">
import Heading from '@/components/Heading.vue';
</script>

<template>
  <div class="px-4 py-6 max-w-full">
    <!-- Header -->
    <!-- <div class="flex sm:items-start justify-between gap-4 sm:gap-0">
      <Heading title="Sales Report" description="" />
      <div><slot name="button" /></div>
    </div> -->

    <!-- Content -->
    <div class="flex flex-col lg:flex-row lg:space-x-12 gap-8">
      <div class="flex-1 min-w-0">
        <section class="space-y-12">
          <slot />
        </section>
      </div>
    </div>
  </div>
</template>
