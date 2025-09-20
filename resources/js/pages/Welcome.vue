<script setup lang="ts">
import { Head, useForm, Link } from '@inertiajs/vue3';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle } from 'lucide-vue-next';

// Banner image
import banner from '@/assets/images/authImage.jpg';

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
  <Head title="Welcome - Al-Ameen Pharmacy">
    <link rel="preconnect" href="https://rsms.me/" />
    <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
  </Head>

  <div class="flex h-screen flex-col items-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 text-slate-800 lg:justify-center">
    <!-- Header -->
    <header class="w-full max-w-7xl px-6 py-4 flex justify-between items-center">
      <div class="flex items-center space-x-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 shadow-md">
          <svg class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.586V5L8 4z"/>
          </svg>
        </div>
        <h1 class="text-lg font-bold text-slate-900">Al-Ameen Pharmacy</h1>
      </div>

      <div>
        <Link
          v-if="$page.props.auth.user"
          :href="route('dashboard')"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:border-blue-500 hover:text-blue-600"
        >
          Dashboard
        </Link>
      </div>
    </header>

    <!-- Main -->
    <main class="flex h-full w-full max-w-7xl flex-col lg:flex-row rounded-2xl bg-white shadow-xl overflow-hidden">
      <!-- Left (Banner + Overlay + Text) -->
      <div
        class="hidden lg:flex flex-1 relative bg-cover bg-center"
        :style="`background-image: url(${banner})`"
      >
        <!-- Dark overlay -->
        <div class="absolute inset-0 bg-black/40"></div>

        <!-- Text content -->
        <div class="relative z-10 flex flex-col justify-center p-10 text-white max-w-md">
          <h2 class="mb-4 text-3xl font-bold leading-tight lg:text-4xl">
            Smart <span class="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Pharmacy</span> Platform
          </h2>
          <p class="mb-8 text-lg text-slate-200">
            Manage prescriptions, inventory, and patient care — all in one place.
          </p>
        </div>
      </div>

      <!-- Right (Login Card) -->
      <div class="relative flex flex-1 items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 p-8">
        <div class="relative z-10 w-full max-w-sm rounded-2xl bg-white/80 backdrop-blur-xl p-8 shadow-lg">
          <h3 class="mb-1 text-2xl font-bold text-slate-900">Welcome Back</h3>
          <p class="mb-6 text-sm text-slate-600">Staff login to continue</p>

          <form @submit.prevent="submit" class="space-y-5">
            <!-- Email -->
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input id="email" type="email" v-model="form.email" placeholder="you@example.com" required />
              <InputError :message="form.errors.email" />
            </div>

            <!-- Password -->
            <div class="grid gap-2">
              <div class="flex items-center justify-between">
                <Label for="password">Password</Label>
                <Link :href="route('password.request')" class="text-sm text-blue-600 hover:underline">Forgot?</Link>
              </div>
              <Input id="password" type="password" v-model="form.password" placeholder="••••••••" required />
              <InputError :message="form.errors.password" />
            </div>

            <!-- Remember -->
            <div class="flex items-center space-x-2">
              <Checkbox id="remember" v-model="form.remember" />
              <Label for="remember" class="text-sm">Remember me</Label>
            </div>

            <!-- Button -->
            <Button type="submit" class="w-full" :disabled="form.processing">
              <LoaderCircle v-if="form.processing" class="mr-2 h-4 w-4 animate-spin" />
              Log in
            </Button>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>
