<!-- <script setup lang="ts">
import InputError from '@/components/InputError.vue';
import TextLink from '@/components/TextLink.vue';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthBase from '@/layouts/AuthLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { LoaderCircle } from 'lucide-vue-next';

defineProps<{
    status?: string;
    canResetPassword: boolean;
}>();

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
    <AuthBase title="Log in to your account" description="Enter your email and password below to log in">
        <Head title="Log in" />

        <div v-if="status" class="mb-4 text-center text-sm font-medium text-green-600">
            {{ status }}
        </div>

        <form @submit.prevent="submit" class="flex flex-col gap-6">
            <div class="grid gap-6">
                <div class="grid gap-2">
                    <Label for="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        required
                        autofocus
                        :tabindex="1"
                        autocomplete="email"
                        v-model="form.email"
                        placeholder="email@example.com"
                    />
                    <InputError :message="form.errors.email" />
                </div>

                <div class="grid gap-2">
                    <div class="flex items-center justify-between">
                        <Label for="password">Password</Label>
                        <TextLink v-if="canResetPassword" :href="route('password.request')" class="text-sm" :tabindex="5">
                            Forgot password?
                        </TextLink>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        required
                        :tabindex="2"
                        autocomplete="current-password"
                        v-model="form.password"
                        placeholder="Password"
                    />
                    <InputError :message="form.errors.password" />
                </div>

                <div class="flex items-center justify-between">
                    <Label for="remember" class="flex items-center space-x-3">
                        <Checkbox id="remember" v-model="form.remember" :tabindex="3" />
                        <span>Remember me</span>
                    </Label>
                </div>

                <Button type="submit" class="mt-4 w-full" :tabindex="4" :disabled="form.processing">
                    <LoaderCircle v-if="form.processing" class="h-4 w-4 animate-spin" />
                    Log in
                </Button>
            </div>

            <div class="text-center text-sm text-muted-foreground">
                Don't have an account?
                <TextLink :href="route('register')" :tabindex="5">Sign up</TextLink>
            </div>
        </form>
    </AuthBase>
</template> -->


<script setup lang="ts">
import InputError from '@/components/InputError.vue';
import TextLink from '@/components/TextLink.vue';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthBase from '@/layouts/AuthLayout.vue';
import { Head, useForm } from '@inertiajs/vue3';
import { LoaderCircle, Pill, Heart, Shield, Activity } from 'lucide-vue-next';

defineProps<{
    status?: string;
    canResetPassword: boolean;
}>();

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
    <AuthBase 
        title="Welcome back to Al-ameen Pharmacy" 
        description=""
    >
        <Head title="Login - Al-ameen Pharmacy" />

        <!-- Pharmacy Themed Header -->
        <div class="mb-8 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 shadow-lg">
                <Pill class="h-8 w-8 text-white" />
            </div>
            <div class="mb-6 flex justify-center space-x-4 text-xs text-muted-foreground">
                <div class="flex items-center space-x-1">
                    <Shield class="h-3 w-3 text-blue-600" />
                    <span>Secure</span>
                </div>
                <div class="flex items-center space-x-1">
                    <Heart class="h-3 w-3 text-emerald-600" />
                    <span>Trusted</span>
                </div>
                <div class="flex items-center space-x-1">
                    <Activity class="h-3 w-3 text-purple-600" />
                    <span>Professional</span>
                </div>
            </div>
        </div>

        <div v-if="status" class="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center text-sm font-medium text-emerald-700">
            <div class="flex items-center justify-center space-x-2">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ status }}</span>
            </div>
        </div>

        <form @submit.prevent="submit" class="space-y-6">
            <div class="space-y-4">
                <div class="space-y-2">
                    <Label for="email" class="text-sm font-medium text-slate-700">
                        Professional Email
                    </Label>
                    <div class="relative">
                        <Input
                            id="email"
                            type="email"
                            required
                            autofocus
                            :tabindex="1"
                            autocomplete="email"
                            v-model="form.email"
                            placeholder="pharmacist@medflow.com"
                            class="pl-10 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                        </svg>
                    </div>
                    <InputError :message="form.errors.email" />
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between">
                        <Label for="password" class="text-sm font-medium text-slate-700">
                            Secure Password
                        </Label>
                        <TextLink 
                            v-if="canResetPassword" 
                            :href="route('password.request')" 
                            class="text-xs text-blue-600 hover:text-blue-700" 
                            :tabindex="5"
                        >
                            Forgot password?
                        </TextLink>
                    </div>
                    <div class="relative">
                        <Input
                            id="password"
                            type="password"
                            required
                            :tabindex="2"
                            autocomplete="current-password"
                            v-model="form.password"
                            placeholder="Enter your secure password"
                            class="pl-10 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    </div>
                    <InputError :message="form.errors.password" />
                </div>

                <div class="flex items-center justify-between pt-2">
                    <Label for="remember" class="flex items-center space-x-3 cursor-pointer">
                        <Checkbox 
                            id="remember" 
                            v-model="form.remember" 
                            :tabindex="3"
                            class="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                        <span class="text-sm text-slate-700">Keep me signed in</span>
                    </Label>
                </div>

                <Button 
                    type="submit" 
                    class="mt-6 w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 focus:ring-blue-500" 
                    :tabindex="4" 
                    :disabled="form.processing"
                    size="lg"
                >
                    <LoaderCircle v-if="form.processing" class="mr-2 h-4 w-4 animate-spin" />
                    <template v-else>
                        <Shield class="mr-2 h-4 w-4" />
                    </template>
                    {{ form.processing ? 'Signing in...' : 'Access Dashboard' }}
                </Button>
            </div>

            <!-- Professional Features -->
            <div class="rounded-lg bg-slate-50 border border-slate-200 p-4">
                <div class="mb-3 text-xs font-medium text-slate-600 uppercase tracking-wide">
                    Professional Features
                </div>
                <div class="grid grid-cols-2 gap-3 text-xs">
                    <div class="flex items-center space-x-2">
                        <div class="h-2 w-2 rounded-full bg-blue-500"></div>
                        <span class="text-slate-600">Prescription Management</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="h-2 w-2 rounded-full bg-emerald-500"></div>
                        <span class="text-slate-600">Inventory Tracking</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="h-2 w-2 rounded-full bg-purple-500"></div>
                        <span class="text-slate-600">Patient Records</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="h-2 w-2 rounded-full bg-orange-500"></div>
                        <span class="text-slate-600">Analytics Dashboard</span>
                    </div>
                </div>
            </div>

            <div class="text-center">
                <div class="text-sm text-muted-foreground">
                    New to MedFlow?
                    <TextLink :href="route('register')" :tabindex="5" class="font-medium text-blue-600 hover:text-blue-700">
                        Create professional account
                    </TextLink>
                </div>
                <div class="mt-2 text-xs text-slate-500">
                    Trusted by over 5,000+ pharmacies worldwide
                </div>
            </div>
        </form>

        <!-- Security Notice -->
        <div class="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <div class="flex items-start space-x-2">
                <Shield class="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div class="text-xs text-blue-700">
                    <div class="font-medium mb-1">HIPAA Compliant & Secure</div>
                    <div>Your login credentials are encrypted and protected with enterprise-grade security standards.</div>
                </div>
            </div>
        </div>
    </AuthBase>
</template>