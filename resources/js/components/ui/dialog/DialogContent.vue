<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import { X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,
  DialogPortal,
  type DialogContentEmits,
  type DialogContentProps,
  useForwardPropsEmits,
} from 'reka-ui'
import DialogOverlay from './DialogOverlay.vue'

type Variant = 'center' | 'right' | 'fullscreen'

const props = withDefaults(
  defineProps<
    DialogContentProps & {
      class?: HTMLAttributes['class']
      variant?: Variant
    }
  >(),
  {
    variant: 'center',
  }
)

const emits = defineEmits<DialogContentEmits>()

const delegatedProps = computed(() => {
  const { class: _, variant: __, ...delegated } = props
  return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'right':
      return `
        fixed z-50 bg-white dark:bg-gray-900

        w-full md:w-[460px]
        h-[85vh] md:h-full

        bottom-0 md:inset-y-0 md:right-0

        translate-y-full md:translate-y-0

        md:translate-x-[105%]

        data-[state=open]:translate-y-0
        md:data-[state=open]:translate-x-0
        data-[state=open]:opacity-100

        data-[state=closed]:translate-y-full
        md:data-[state=closed]:translate-x-[105%]
        data-[state=closed]:opacity-0
      `
    default:
      return `
        left-1/2 top-1/2
        -translate-x-1/2 -translate-y-1/2
      `
  }
})
</script>

<template>
  <DialogPortal>
    <DialogOverlay />

    <DialogContent
      :class="
        cn(
          'transition-[transform,opacity]',
          'duration-300',
          'ease-out',
          'shadow-2xl',
          'rounded-t-2xl md:rounded-none',
          variantClasses,
          props.class
        )
      "
    >
      <slot />

      <DialogClose
        class="absolute top-4 right-4 opacity-70 hover:opacity-100 focus:outline-none"
      >
        <X class="h-4 w-4" />
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
