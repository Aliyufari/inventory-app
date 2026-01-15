<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue"
import { useInvoice } from "@/stores/invoice"
import { Button } from "@/components/ui/button"
import { Printer, X, FileText, Loader2 } from "lucide-vue-next"

const invoiceStore = useInvoice()

const isOpen = computed({
  get: () => invoiceStore.showPreview,
  set: (val) => {
    if (!val) invoiceStore.clearInvoice()
  }
})

const printInvoice = () => {
  if (!invoiceStore.invoicePDFDataURL) return
  const base64 = invoiceStore.invoicePDFDataURL.split(",")[1]
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([array], { type: "application/pdf" })
  const blobURL = URL.createObjectURL(blob)
  const iframe = document.createElement("iframe")
  iframe.style.display = "none"
  document.body.appendChild(iframe)
  iframe.src = blobURL

  iframe.onload = () => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
      URL.revokeObjectURL(blobURL)
    }, 1000)
  }
}

// Close on ESC
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && isOpen.value) isOpen.value = false
}
onMounted(() => window.addEventListener("keydown", onKeydown))
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4">
        
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur" @click="isOpen = false" />

        <!-- Modal / Drawer -->
        <Transition name="zoom" appear>
          <aside class="relative w-full max-w-full sm:max-w-3xl md:max-w-2xl lg:max-w-2xl h-[88vh] sm:h-[90vh] bg-white shadow-2xl rounded-2xl flex flex-col overflow-hidden">
            
            <!-- Header -->
            <header class="flex items-center justify-between p-3 sm:p-4 border-b">
              <div class="flex items-center gap-2">
                <FileText class="text-primary w-5 h-5" />
                <h2 class="font-bold text-lg sm:text-xl text-slate-800">Print Receipt</h2>
              </div>
              <button @click="isOpen = false" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X class="w-5 h-5 text-slate-500" />
              </button>
            </header>

            <!-- Main -->
            <main class="flex-1 bg-gray-100 p-2 sm:p-4 overflow-hidden">
              <div class="w-full h-full bg-white rounded-lg shadow-inner relative min-h-[400px] sm:min-h-[500px]">
                <iframe 
                  v-if="invoiceStore.invoicePDFDataURL" 
                  :src="invoiceStore.invoicePDFDataURL" 
                  class="w-full h-full border-0 rounded-lg" 
                />
                <div v-else class="absolute inset-0 flex flex-col items-center justify-center">
                  <Loader2 class="animate-spin text-primary w-10 h-10 sm:w-12 sm:h-12" />
                  <p class="mt-2 text-sm sm:text-base text-gray-500">Loading PDF...</p>
                </div>
              </div>
            </main>

            <!-- Footer -->
            <footer class="p-3 sm:p-4 border-t flex flex-col sm:flex-row gap-2 sm:gap-3 bg-white">
              <Button variant="outline" class="bg-red-200 flex-1 rounded-xl" @click="isOpen = false">Close</Button>
              <Button class="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-sm" @click="printInvoice">
                <Printer class="w-4 h-4 mr-2" /> Print Receipt
              </Button>
            </footer>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Fade transition */
.fade-enter-active, .fade-leave-active { 
  transition: opacity 0.3s ease; 
}
.fade-enter-from, .fade-leave-to { 
  opacity: 0; 
}

/* Zoom modal animation */
.zoom-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.zoom-leave-active {
  transition: all 0.2s ease-in;
}
.zoom-enter-from {
  opacity: 0;
  transform: scale(0.95);
}
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* Ensure iframe fills container on mobile too */
iframe {
  color-scheme: light;
  min-height: 100%;
  min-width: 100%;
}
</style>
