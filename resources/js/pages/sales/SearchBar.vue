<script setup lang="ts">
import { ref, nextTick, onUnmounted, watch } from 'vue'
import { Search, Camera, X, Scan } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { Html5Qrcode } from 'html5-qrcode'

const props = defineProps<{
  resultsCount: number // Pass the length of searchResults from the parent
}>()

const emit = defineEmits(['barcodeScanned', 'productSearch'])
const SearchableInput = ref('')
const SearchableInputRef = ref<HTMLInputElement | null>(null)
const inputMode = ref<'typing' | 'scanning'>('typing')
const showCamera = ref(false)
let html5QrCode: Html5Qrcode | null = null
let debounceTimer: any = null

// Watch the results count: If a unique item is found, clear the input
watch(() => props.resultsCount, (newCount) => {
  if (newCount === 1 && inputMode.value === 'typing') {
    // We delay slightly so the user sees the match before it clears
    setTimeout(() => {
      SearchableInput.value = ''
    }, 500)
  }
})

const handleInput = () => {
  clearTimeout(debounceTimer)
  const val = SearchableInput.value.trim()
  
  if (!val) {
    inputMode.value = 'typing'
    emit('productSearch', '')
    return
  }

  if (/^[0-9A-Z-]{7,}$/i.test(val)) {
    inputMode.value = 'scanning'
    debounceTimer = setTimeout(() => {
      emit('barcodeScanned', val)
      SearchableInput.value = ''
      inputMode.value = 'typing'
    }, 150)
  } else {
    inputMode.value = 'typing'
    debounceTimer = setTimeout(() => emit('productSearch', val), 300)
  }
}

const toggleCamera = async () => {
  if (showCamera.value) {
    await html5QrCode?.stop()
    showCamera.value = false
  } else {
    showCamera.value = true
    await nextTick()
    html5QrCode = new Html5Qrcode('camera-scanner')
    html5QrCode.start(
      { facingMode: 'environment' }, 
      { fps: 15, qrbox: 200 }, 
      (text) => {
        emit('barcodeScanned', text)
        toggleCamera()
      }
    ).catch(() => toast.error("Camera access denied"))
  }
}

onUnmounted(() => html5QrCode?.stop())
</script>

<template>
  <div class="space-y-4">
    <div class="relative">
      <Search
        v-if="inputMode === 'typing'"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
      />
      <Scan
        v-else
        class="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 animate-pulse w-5 h-5"
      />

      <input
        ref="SearchableInputRef"
        v-model="SearchableInput"
        type="text"
        placeholder="Search product or scan..."
        class="w-full pl-11 pr-12 py-3.5 text-base bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all"
        @input="handleInput"
      />
      
      <Button 
        type="button"
        @click="toggleCamera" 
        variant="ghost" 
        size="icon"
        class="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded-xl"
      >
        <Camera class="w-5 h-5 text-gray-500" />
      </Button>
    </div>

    <div v-if="showCamera" class="relative mx-auto max-w-sm bg-black rounded-2xl overflow-hidden aspect-square shadow-2xl border-4 border-white">
      <div id="camera-scanner" class="w-full h-full" />
      <Button @click="toggleCamera" size="icon" variant="destructive" class="absolute top-3 right-3 rounded-full shadow-lg">
        <X class="w-4 h-4" />
      </Button>
      <div class="absolute inset-0 border-[40px] border-black/30 pointer-events-none">
          <div class="w-full h-full border-2 border-white/50 rounded-lg"></div>
      </div>
    </div>
  </div>
</template>