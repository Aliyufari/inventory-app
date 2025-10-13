<script setup lang="ts">
import { computed, watch } from "vue"
import { useInvoice } from "@/stores/invoices"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const invoiceStore = useInvoice()

const show = computed(() => invoiceStore.showPreview && !!invoiceStore.invoicePDFDataURL)

const printInvoice = () => {
  console.log('🖨️ Initiating print...')
  
  if (!invoiceStore.invoicePDFDataURL) {
    console.error('❌ No PDF data available to print')
    return
  }

  try {
    // Convert data URL to Blob
    const base64Data = invoiceStore.invoicePDFDataURL.split(',')[1]
    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })
    const blobUrl = URL.createObjectURL(blob)
    
    console.log('📄 PDF Blob created')
    
    // Create hidden iframe with blob URL
    const printFrame = document.createElement('iframe')
    printFrame.style.position = 'fixed'
    printFrame.style.right = '0'
    printFrame.style.bottom = '0'
    printFrame.style.width = '0'
    printFrame.style.height = '0'
    printFrame.style.border = 'none'
    
    document.body.appendChild(printFrame)
    
    printFrame.onload = () => {
      console.log('✅ PDF loaded in print frame')
      
      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus()
          printFrame.contentWindow?.print()
          console.log('🖨️ Print dialog opened')
        } catch (e) {
          console.error('❌ Print error:', e)
        }
        
        // Cleanup
        setTimeout(() => {
          document.body.removeChild(printFrame)
          URL.revokeObjectURL(blobUrl)
          console.log('🧹 Cleanup complete')
        }, 1000)
      }, 250)
    }
    
    printFrame.onerror = (error) => {
      console.error('❌ Failed to load PDF:', error)
      document.body.removeChild(printFrame)
      URL.revokeObjectURL(blobUrl)
    }
    
    // Set the blob URL
    printFrame.src = blobUrl
    
  } catch (error) {
    console.error('❌ Print preparation error:', error)
  }
}

// Auto-close handling
const handleOpenChange = (val: boolean) => {
  if (!val) {
    console.log('🚪 Closing invoice preview')
    invoiceStore.clearInvoice()
  }
}

// Debug watcher
watch(show, (newVal) => {
  console.log('🔄 InvoicePreview visibility:', newVal)
  if (newVal) {
    console.log('📄 PDF Data URL exists:', !!invoiceStore.invoicePDFDataURL)
  }
})
</script>

<template>
  <Dialog :open="show" @update:open="handleOpenChange">
    <DialogContent
      class="max-w-4xl w-full h-[90vh] flex flex-col shadow-lg rounded-2xl border border-gray-200"
      aria-describedby="invoice-preview-description"
    >
      <DialogHeader>
        <DialogTitle class="text-lg font-semibold text-gray-800 flex justify-between items-center">
          Invoice Preview
        </DialogTitle>
        <DialogDescription id="invoice-preview-description" class="sr-only">
          Preview and print your generated invoice
        </DialogDescription>
      </DialogHeader>
     
      <div class="flex-1 overflow-hidden bg-gray-50 rounded-lg">
        <iframe
          v-if="invoiceStore.invoicePDFDataURL"
          id="invoice-preview-frame"
          :src="invoiceStore.invoicePDFDataURL"
          class="w-full h-full border-0"
          @load="console.log('✅ Invoice PDF loaded in preview')"
        ></iframe>
        <div v-else class="flex items-center justify-center h-full text-gray-500">
          Loading invoice...
        </div>
      </div>
     
      <DialogFooter class="flex justify-between mt-4 gap-3">
        <Button
          variant="secondary"
          @click="invoiceStore.clearInvoice"
          class="flex-1"
        >
          Close
        </Button>
        <Button
          class="bg-blue-600 hover:bg-blue-700 text-white flex-1"
          @click="printInvoice"
          :disabled="!invoiceStore.invoicePDFDataURL"
        >
          🖨️ Print Invoice
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>