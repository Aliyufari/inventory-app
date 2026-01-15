<script setup lang="ts">
import { cn } from '@/lib/utils'
import { DialogOverlay, type DialogOverlayProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<
  DialogOverlayProps & { class?: HTMLAttributes['class'] }
>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props
  return delegated
})
</script>

<template>
  <DialogOverlay
    data-slot="dialog-overlay"
    v-bind="delegatedProps"
    :class="
      cn(
        'fixed inset-0 z-40',
        'bg-black/40',
        'backdrop-blur-[1px]',
        'transition-opacity duration-300',
        'data-[state=open]:opacity-100',
        'data-[state=closed]:opacity-0',
        props.class
      )
    "
  />
</template>
