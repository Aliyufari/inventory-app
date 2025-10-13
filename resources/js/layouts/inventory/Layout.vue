<script setup lang="ts">
import Heading from '@/components/Heading.vue'
import { usePage } from '@inertiajs/vue3'

const page = usePage()
const currentPath = page.props.ziggy?.location
  ? new URL(page.props.ziggy.location).pathname
  : ''
</script>

<template>
  <div class="px-4 py-6 max-w-full"> <!-- ✅ Added max-w-full -->
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0"> <!-- ✅ Same responsive header as products -->
      <Heading title="Inventory" description="Manage all transactions and stock records" />
      <div><slot name="button" /></div> <!-- ✅ Moved slot inside -->
    </div>

    <!-- Content -->
    <div class="mt-6 flex flex-col lg:flex-row lg:space-x-12 gap-8"> <!-- ✅ Same structure as products -->
      <div class="flex-1 min-w-0"> <!-- ✅ CRITICAL: Added min-w-0 -->
        <section class="space-y-12">
          <slot />
        </section>
      </div>
    </div>
  </div>
</template>