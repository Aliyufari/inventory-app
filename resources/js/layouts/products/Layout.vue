<script setup lang="ts">
import Heading from '@/components/Heading.vue';
import Button from '@/components/ui/button/Button.vue';
import { Link, usePage } from '@inertiajs/vue3';
import { StoreIcon, UserPlus } from 'lucide-vue-next';

const page = usePage();
const currentPath = page.props.ziggy?.location
    ? new URL(page.props.ziggy.location).pathname
    : '';
</script>

<template>
  <div class="px-4 py-6 max-w-full">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
      <Heading title="Products" description="Manage products" />
      <div><slot name="button" /></div>
    </div>

    <!-- Content -->
    <div class="mt-6 flex flex-col lg:flex-row lg:space-x-12 gap-8">
      <div class="flex-1 min-w-0">
        <section class="space-y-12">
          <slot />
        </section>
      </div>
    </div>
  </div>
</template>
