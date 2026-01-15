<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  modelValue: boolean
  message?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const isOpen = ref(props.modelValue)

watch(() => props.modelValue, val => (isOpen.value = val))
watch(isOpen, val => emit('update:modelValue', val))

const close = () => {
  isOpen.value = false
  emit('cancel')
}

const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', handleEsc))
onBeforeUnmount(() => document.removeEventListener('keydown', handleEsc))

const confirm = () => emit('confirm')
</script>

<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px]"
      @click.self="close"
    >
      <transition name="scale-fade">
        <div
          class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full overflow-hidden"
        >
          <!-- Body -->
          <div class="p-6 text-center space-y-3">
            <slot>
              <p class="text-gray-800 dark:text-gray-200 text-lg font-medium">
                {{ message || 'Are you sure?' }}
              </p>
            </slot>

            <!-- Irreversible Warning -->
            <p
              v-if="danger"
              class="text-sm text-red-600 dark:text-red-400"
            >
              This action cannot be reverted.
            </p>
          </div>

          <!-- Footer -->
          <div class="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-center gap-3">
            <button
              class="px-5 py-2 rounded-lg bg-gray-200 dark:bg-gray-700
                     text-gray-700 dark:text-gray-300
                     hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              @click="close"
            >
              {{ cancelText || 'Cancel' }}
            </button>

            <button
              class="px-5 py-2 rounded-lg text-white transition"
              :class="
                danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              "
              @click="confirm"
            >
              {{ confirmText || 'Confirm' }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-fade-enter-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.scale-fade-enter-from {
  transform: scale(0.95);
  opacity: 0;
}
.scale-fade-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
