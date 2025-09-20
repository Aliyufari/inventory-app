<script setup lang="ts">
import Heading from '@/components/Heading.vue';
import { Link, usePage } from '@inertiajs/vue3';

const page = usePage();

const currentPath = page.props.ziggy?.location ? new URL(page.props.ziggy.location).pathname : '';
</script>

<template>
    <div class="px-4 py-6">
        <div class="flex items-center justify-between">
            <Heading title="Categories" description="Manage categories" />
            <div><slot name="button" /></div>
        </div>

        <div class="flex flex-col space-y-8 md:space-y-0 lg:flex-row lg:space-x-12 lg:space-y-0">

            <div class="flex-1">
                <section class="space-y-12">
                    <slot />
                </section>
            </div>
        </div>
    </div>
</template>
