<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

// Components
import HeadingSmall from '@/components/HeadingSmall.vue';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Eye, PenBoxIcon, UserPlus } from 'lucide-vue-next';

const passwordInput = ref<HTMLInputElement | null>(null);

const form = useForm({
    name: '',
    price: '',
    brand: '',
    quantity: '',
    store_id: ''
});

const updateProduct = (e: Event) => {
  e.preventDefault();

  form.post(route('users.store'), {
    preserveScroll: true,
    onSuccess: () => closeModal(),
    onError: () => passwordInput.value?.focus(),
    onFinish: () => form.reset(),
  });
};

const closeModal = () => {
    form.clearErrors();
    form.reset();
};
</script>

<template>
    <div class="space-y-6">
        <Dialog>
            <DialogTrigger as-child>
                <Button class="bg-amber-100 hover:bg-amber-200"><Eye class="text-black" /></Button>
            </DialogTrigger>
            <DialogContent>
                <form class="space-y-6" @submit="updateProduct">
                    <DialogHeader class="space-y-3">
                        <DialogTitle>Edit product</DialogTitle>
                    </DialogHeader>

                    <div class="grid gap-2">
                        <Label for="name" class="sr-only">Name</Label>
                        <Input id="name" type="text" v-model="form.name" placeholder="Name" />
                        <InputError :message="form.errors.name" />
                    </div>

                    <div class="grid gap-2">
                        <Label for="price" class="sr-only">Price</Label>
                        <Input id="price" type="number" v-model="form.price" placeholder="Product Price" />
                        <InputError :message="form.errors.price" />
                    </div>

                    <div class="grid gap-2">
                        <Label for="brand" class="sr-only">Brand</Label>
                        <Input id="brand" type="text" v-model="form.brand" placeholder="Product Brand" />
                        <InputError :message="form.errors.brand" />
                    </div>

                    <div class="grid gap-2">
                        <Label for="quantity" class="sr-only">Quantity</Label>
                        <Input id="quantity" type="number" v-model="form.quantity" placeholder="Product Quantity" />
                        <InputError :message="form.errors.quantity" />
                    </div>

                    <div class="grid gap-2">
                        <Label for="role" class="sr-only">Store</Label>
                        <Select
                            id="role"
                            placeholder="Select store"
                            v-model="form.store_id"
                            :options="[
                                { label: 'Main Store', value: '1' },
                                { label: 'Store 2', value: '1' }
                            ]"
                        />
                        <InputError :message="form.errors.store_id" />
                    </div>

                    <DialogFooter class="gap-2">
                        <DialogClose as-child>
                        <Button variant="secondary" @click="closeModal">Cancel</Button>
                        </DialogClose>

                        <Button type="submit" :disabled="form.processing">
                        Submit
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    </div>
</template>
