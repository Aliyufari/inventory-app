<script setup lang="ts">
import { computed, watch, ref, onMounted, onBeforeUnmount } from 'vue'
import { X } from 'lucide-vue-next'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    closeOnBackdrop?: boolean
    closeOnEsc?: boolean
    showCloseButton?: boolean
    width?: string
  }>(),
  { closeOnBackdrop: true, closeOnEsc: true, showCloseButton: true, width: '100%' }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'saved'): void 
}>()

const localShow = ref(false)
watch(() => props.modelValue, (val) => {
  localShow.value = val
}, { immediate: true })

const closeModal = () => {
  localShow.value = false 
}

const afterLeave = () => {
  emit('update:modelValue', false)
  emit('close')
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.closeOnEsc && localShow.value) closeModal()
}

watch(() => localShow.value, val => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = val ? 'hidden' : ''
  }
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

const panelClasses = computed(
  () =>
    `h-full bg-white shadow-2xl overflow-y-auto flex flex-col
     ${props.width || '100%'} sm:w-2/3 md:w-1/2 lg:w-1/3`
)
</script>

<template>
  <Teleport to="body">
    <div v-if="modelValue || localShow" class="relative z-50">
      
      <Transition name="fade" appear>
        <div 
          v-if="localShow" 
          class="fixed inset-0 bg-black/50" 
          @click="props.closeOnBackdrop && closeModal()" 
        />
      </Transition>

      <div class="fixed inset-0 flex justify-end pointer-events-none backdrop-blur-[1px]">
        <Transition 
          name="slide-right" 
          appear 
          @after-leave="afterLeave"
        >
          <div 
            v-if="localShow" 
            :class="panelClasses" 
            class="pointer-events-auto" 
            @click.stop
          >
            <!-- HEADER -->
            <div class="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white z-10">
              <h3 class="text-lg font-semibold text-gray-900">{{ props.title ?? '' }}</h3>
              <button v-if="props.showCloseButton" @click="closeModal"
                      class="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-900 transition-colors">
                <X class="w-4 h-4"/>
              </button>
            </div>

            <!-- BODY -->
            <div class="flex-1 overflow-y-auto p-6">
              <slot />
            </div>

            <!-- FOOTER -->
            <div v-if="$slots.footer" class="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-start z-10">
              <slot name="footer"/>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Backdrop Fade */
.fade-enter-active,
.fade-leave-active { 
  transition: opacity 0.25s ease-out; 
}
.fade-enter-from,
.fade-leave-to { 
  opacity: 0; 
}

/* Panel Slide: Optimized for 2026 UX Standards */
.slide-right-enter-active { 
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease; 
}

.slide-right-leave-active { 
  transition: transform 0.25s cubic-bezier(0.32, 0, 0.67, 0), opacity 0.2s ease; 
}

.slide-right-enter-from,
.slide-right-leave-to { 
  transform: translateX(100%); 
  opacity: 0; 
}

/* Scrollbar Utility */
.flex-1.overflow-y-auto {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.flex-1.overflow-y-auto::-webkit-scrollbar {
  display: none;
}
</style>
