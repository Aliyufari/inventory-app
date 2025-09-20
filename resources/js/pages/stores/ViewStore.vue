<script setup lang="ts">
import { useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

// Components
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
import { Eye, PenBoxIcon, UserPlus } from 'lucide-vue-next';

const passwordInput = ref<HTMLInputElement | null>(null);

const form = useForm({
    name: '',
    description: ''
});

const addUser = (e: Event) => {
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
                <form class="space-y-6">
                    <DialogHeader class="space-y-3">
                        <DialogTitle>Viewing store</DialogTitle>
                    </DialogHeader>

                    <div class="grid gap-2">
                        <Label for="name" class="sr-only">Name</Label>
                        <Input id="name" type="text" v-model="form.name" placeholder="Name" />
                        <InputError :message="form.errors.name" />
                    </div>

                    <div class="grid gap-2">
                        <Label for="role" class="sr-only">Description</Label>
                        <Textarea v-model="form.description" value="" />
                        <InputError :message="form.errors.description" />
                    </div>

                    <DialogFooter class="gap-2">
                        <DialogClose as-child>
                        <Button variant="secondary" @click="closeModal">Cancel</Button>
                        </DialogClose>

                        <Button type="submit" variant="destructive" :disabled="form.processing">
                        Update
                        </Button>
                    </DialogFooter>
                    </form>
            </DialogContent>
        </Dialog>
    </div>
</template>
