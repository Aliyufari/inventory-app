<script setup lang="ts">
import AuthLayout from '@/layouts/auth/AuthSplitLayout.vue';
import { Toaster } from 'vue-sonner';

defineProps<{
    title?: string;
    description?: string;
}>();
</script>

<template>
    <AuthLayout :title="title" :description="description">
        <slot />
        <Toaster position="top-right" :expand="true" theme="light" richColors />
    </AuthLayout>
</template>
