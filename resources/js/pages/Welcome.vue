<script setup lang="ts">
import { Head, useForm, Link } from '@inertiajs/vue3';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle } from 'lucide-vue-next';

import logo from '@/assets/images/logo.jpg';
import banner from '@/assets/images/b1.jpg';

const form = useForm({
  email: '',
  password: '',
  remember: false,
});

const submit = () => {
  form.post(route('login'), {
    onFinish: () => form.reset('password'),
  });
};
</script>

<template>
  <Head title="Welcome - DYK Super Store" />

  <div
    class="relative min-h-screen w-full bg-cover bg-center"
    :style="`background-image: url(${banner})`"
  >
    <!-- Dark overlay -->
    <div class="absolute inset-0 bg-black/50"></div>

    <!-- Centered content -->
    <div class="relative z-10 flex min-h-screen items-center justify-center px-6">

      <!-- Login Card -->
      <div
        class="w-full max-w-md rounded-2xl bg-white p-8 sm:p-10
               shadow-[0_20px_50px_rgba(0,0,0,0.25)]"
      >
      
        <!-- Logo -->
        <div class="mb-6 flex flex-col items-center text-center">
          <div class="relative mb-4">
            <div class="absolute inset-0 bg-gradient-to-r from-primary-500 to-cyan-500 rounded-2xl blur-xl opacity-50"></div>
            <img 
              :src="logo" 
              alt="DYK Super Store Logo" 
              class="relative w-18 h-18 object-cover rounded-2xl shadow-lg ring-4 ring-white"
            />
          </div>

          <h1 class="text-2xl font-bold text-slate-900">
            DYK SUPER STORE LTD
          </h1>

          <p class="mt-1 text-sm text-slate-500">
            Supermarket Management System
          </p>
        </div>

        <!-- Welcome -->
        <div class="mb-6 text-center">
          <p class="text-sm text-slate-500">
            Sign in to continue
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="submit" class="space-y-5">
          <!-- Email -->
          <div class="space-y-1">
            <Label for="email">Username</Label>
            <Input
              id="email"
              type="email"
              v-model="form.email"
              placeholder="you@example.com"
              required
            />
            <InputError :message="form.errors.email" />
          </div>

          <!-- Password -->
          <div class="space-y-1">
            <Label for="password">Password</Label>
            <Input
              id="password"
              type="password"
              v-model="form.password"
              placeholder="••••••••"
              required
            />
            <InputError :message="form.errors.password" />
          </div>

          <!-- Remember -->
          <div class="flex items-center justify-end gap-2">
            <Link
              :href="route('password.request')"
              class="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <!-- Submit -->
          <Button
            type="submit"
            class="w-full h-11 text-base font-semibold"
            :disabled="form.processing"
          >
            <LoaderCircle
              v-if="form.processing"
              class="mr-2 h-4 w-4 animate-spin"
            />
            Sign in
          </Button>
        </form>

        <!-- Footer -->
        <p class="mt-6 text-center text-xs text-slate-400">
          © {{ new Date().getFullYear() }} DYK Super Store. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

