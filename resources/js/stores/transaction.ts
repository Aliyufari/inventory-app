import { defineStore } from 'pinia'
import axios from 'axios'
import { jsPDF } from 'jspdf'
// Assuming these paths are correct in your project structure
import logo from '@/assets/images/logo.png' 
import robotoFont from '@/assets/fonts/Roboto.ttf'
import robotoBoldFont from '@/assets/fonts/Roboto-Bold.ttf' 
import { Inventory } from '@/types' 

// --- MERGED STATE INTERFACE (for clarity, though 'any' is used in the implementation) ---
interface TransactionState {
  // From useInventory
  inventories: any[]
  pagination: { links: any; meta: any } | null
  modalType: string | null
  selected: any | null
  search: string
  loading: boolean
  inventoryError: string | null // Renamed to avoid collision with invoiceError
  
  // From useInvoice
  invoicePDFDataURL: string | null
  isGenerating: boolean
  showPreview: boolean
}

// --- MERGED STORE: useTransaction ---
export const useTransaction = defineStore('transaction', {
  state: (): TransactionState => ({
    // Inventory/List State
    inventories: [] as any[],
    pagination: null,
    modalType: null, // Controls the 'add/edit' transaction modal
    selected: null,
    search: '',
    loading: false,
    inventoryError: null,

    // Invoice/PDF State
    invoicePDFDataURL: null,
    isGenerating: false,
    showPreview: false,
  }),

  actions: {
    // --- INVENTORY / CRUD ACTIONS (FROM useInventory) ---

    async fetchInventories(page: number = 1) {
      this.loading = true
      this.inventoryError = null
      try {
        // Assuming 'route' is globally available via Inertia or a helper
        const { data } = await axios.get(route("inventories.index"), {
          params: { page, search: this.search },
        })
        this.inventories = data.inventories.data || []
        this.pagination = {
          links: data.inventories.links,
          meta: data.inventories.meta,
        }
      } catch (err: any) {
        console.error("Error fetching inventories:", err)
        this.inventoryError = err.message || "Failed loading inventories"
      } finally {
        this.loading = false
      }
    },

    async deleteInventory(id: string) {
      this.loading = true
      this.inventoryError = null
      try {
        const { data } = await axios.delete(route('inventory.delete', id))
        if (data.status) {
          this.inventories = this.inventories.filter((s) => s.id !== id)
          this.closeModal()
          await this.fetchInventories()
        } else {
          this.inventoryError = data.message || 'Failed to delete inventory'
        }
      } catch (error: any) {
        console.error('Error deleting inventory:', error)
        this.inventoryError = error.message || 'Failed to delete inventory'
      } finally {
        this.loading = false
      }
    },

    resetSearch() {
      this.search = ""
      this.fetchInventories(1)
    },

    openModal(type: string, payload: any | null = null) {
      console.log('📂 Opening modal:', type, payload)
      this.modalType = type
      this.selected = payload
    },

    closeModal() {
      console.log('🚪 Closing inventory modal')
      this.modalType = null
      this.selected = null
    },

    addLocal(inventory: any) {
      this.inventories.unshift(inventory)
    },

    updateLocal(updated: any) {
      const idx = this.inventories.findIndex((i) => i.id === updated.id)
      if (idx !== -1) this.inventories[idx] = updated
    },

    removeLocal(id: number | string) {
      this.inventories = this.inventories.filter((i) => i.id !== id)
    },
    
    // --- INVOICE / PDF ACTIONS (FROM useInvoice) ---
    
    // Helper Functions (Private methods or defined locally within generateInvoice)
    formatCurrency(amount: number, useDecimals: boolean = true): string {
      const options: Intl.NumberFormatOptions = {
        minimumFractionDigits: useDecimals ? 2 : 0,
        maximumFractionDigits: useDecimals ? 2 : 0,
        useGrouping: true,
      }
      return new Intl.NumberFormat('en-NG', options).format(amount)
    },

    formatDateTime(dateString?: string): string {
      const date = dateString ? new Date(dateString) : new Date()
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }
      const formattedDate = date.toLocaleDateString('en-GB', dateOptions)
      const formattedTime = date.toLocaleTimeString('en-US', timeOptions)
      return `${formattedDate} ${formattedTime}`
    },
    
    capitalizeFirstLetter(str?: string): string {
      return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : 'N/A'
    },
    
    getProductName(item: any): string {
      return item.product_name || item.name || item.product?.name || 'Unknown Product'
    },
    
    getUnitPrice(item: any): number {
      return item.unit_price || item.price || 0
    },
    
    getItemTotal(item: any): number {
      return item.total && item.total > 0
        ? item.total
        : (item.quantity || 0) * this.getUnitPrice(item)
    },
    
    async getImageAsBase64(url: string) {
      return new Promise<string>((resolve) => {
        const img = new Image()
        img.crossOrigin = 'Anonymous'
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        }
        img.onerror = () => resolve('')
        img.src = url
      })
    },
    
    generateInvoice: async function (
      inventory: Inventory,
      servedBy?: string,
      customerName?: string
    ) {
      this.isGenerating = true
      
      // Helper function that needs the tempDoc for calculation (must be local to run)
      const truncateText = (text: string, maxWidth: number, fontSize: number, tempDoc: jsPDF): string => {
        tempDoc.setFontSize(fontSize)
        const textWidth = tempDoc.getTextWidth(text)
        if (textWidth <= maxWidth) return text
        let truncated = text
        while (tempDoc.getTextWidth(truncated + '...') > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1)
        }
        return truncated + '...'
      }
      

      // Define constants for layout
      const pageWidth = 80
      const margin = 4
      const contentWidth = pageWidth - 2 * margin
      
      // Column definitions
      const colItemWidth = 26
      const rowHeight = 4.5 
      const logoHeight = 16

      // Table Column Positions
      const colNo = margin + 1
      const colItem = margin + 7 
      const colQty = margin + 40 
      const colPrice = margin + 49 
      const colTotal = margin + 60 
      
      const totalsLabelX = margin + 45 
      const contentRightEdge = pageWidth - margin; 

      // Invoice Info Alignment
      const detailValueOffset = 25 
      const detailTitleX = margin + 1 

      const items = inventory.items || inventory.inventory_items || []
      let font: string = ''
      let boldFont: string = ''
      let logoImg: string = ''
      
      let totalValueStart: number = 0 
      const nairaSpacing = 0.5 

      try {
        // --- 1. Load Assets & Register Font Data ---
        
        const [robotoFontResponse, robotoBoldFontResponse, logoBase64] = await Promise.all([
          fetch(robotoFont),
          fetch(robotoBoldFont),
          this.getImageAsBase64(logo)
        ]);
        
        font = new Uint8Array(await robotoFontResponse.arrayBuffer()).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )
        
        boldFont = new Uint8Array(await robotoBoldFontResponse.arrayBuffer()).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
        )

        logoImg = logoBase64

        // --- 2. Calculate Actual Total Height (for DYNAMIC page sizing) ---
        const baseContentHeight = 55
        const headerHeight = 3.5
        const discountHeight = (inventory.discount ?? 0) > 0 ? 3.5 : 0
        const totalFooterHeight = 3.5 + 3.5 + 5 + 8

        let calculatedItemHeight = 0
        const tempDoc = new jsPDF()
        
        // Register fonts on tempDoc for accurate measurement
        tempDoc.addFileToVFS('Roboto.ttf', font)
        tempDoc.addFont('Roboto.ttf', 'Roboto', 'normal')
        tempDoc.addFileToVFS('Roboto-Bold.ttf', boldFont)
        tempDoc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold')
        
        tempDoc.setFont('Roboto', 'normal')
        tempDoc.setFontSize(6.5)

        for (const item of items) {
          const productName = this.getProductName(item)
          const lines = tempDoc.splitTextToSize(productName, colItemWidth) 
          calculatedItemHeight += lines.length * rowHeight
        }

        const EXTRA_BLANK_SPACE = 20
        const totalHeight =
          baseContentHeight +
          headerHeight +
          calculatedItemHeight +
          discountHeight +
          totalFooterHeight +
          EXTRA_BLANK_SPACE

        // --- 3. Create Final PDF Document ---
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [pageWidth, totalHeight],
        })

        // Register Fonts on final document
        doc.addFileToVFS('Roboto.ttf', font)
        doc.addFileToVFS('Roboto-Bold.ttf', boldFont) 
        
        doc.addFont('Roboto.ttf', 'Roboto', 'normal')
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold')
        doc.addFont('Roboto.ttf', 'Roboto', 'italic')
        doc.setFont('Roboto', 'normal')

        // --- 4. Start Drawing Content (Same as previous implementation) ---
        let y = 6

        // Header and Business Info
        const logoX = (pageWidth - logoHeight) / 2
        doc.addImage(logoImg, 'PNG', logoX, y, logoHeight, logoHeight)
        y += logoHeight + 3

        doc.setFontSize(11)
        doc.setFont('Roboto', 'bold')
        doc.text('AL-AMEEN PHARMACY', pageWidth / 2, y, { align: 'center' })
        y += 4

        doc.setFontSize(7)
        doc.setFont('Roboto', 'normal')
        doc.text('123 Medical Street, City, State', pageWidth / 2, y, { align: 'center' })
        y += 3
        doc.text('Phone: (123) 456-7890', pageWidth / 2, y, { align: 'center' })
        y += 3
        doc.text('Email: info@pharmacy.com', pageWidth / 2, y, { align: 'center' })
        y += 4

        doc.setLineWidth(0.2)
        doc.line(margin, y, pageWidth - margin, y)
        y += 3

        // --- INVOICE INFO SECTION ---
        const details = [
          { label: 'Invoice No:', value: inventory.invoice_number ?? 'N/A' },
          { label: 'Date:', value: this.formatDateTime(inventory.created_at) },
          { label: 'Served By:', value: servedBy ?? inventory.user?.name ?? 'N/A' },
          { label: 'Customer:', value: customerName ?? 'Walk-in' },
          { label: 'Payment Method:', value: this.capitalizeFirstLetter(inventory.payment_method) },
        ]

        doc.setFontSize(7)
        details.forEach((detail) => {
          doc.setFont('Roboto', 'bold')
          doc.text(detail.label, detailTitleX, y)
          doc.setFont('Roboto', 'normal')
          // Use the local truncateText function
          const valueText = truncateText(detail.value, contentWidth - detailValueOffset - 5, 7, tempDoc) 
          doc.text(valueText, margin + detailValueOffset, y)
          y += 3.5
        })
        // --- END INVOICE INFO SECTION ---

        y += 1
        doc.line(margin, y, pageWidth - margin, y)
        y += 3

        // ===== TABLE HEADER =====
        doc.setFontSize(6.5)
        doc.setFont('Roboto', 'bold')
        doc.setFillColor(245, 245, 245)
        doc.rect(margin, y - 2, contentWidth, 3.5, 'F')

        doc.text('S/N', colNo, y) 
        doc.text('ITEM', colItem, y)
        doc.text('QTY', colQty, y, { align: 'center' })
        doc.text('PRICE', colPrice, y, { align: 'left' })
        doc.text('TOTAL', colTotal, y, { align: 'left' })
        y += 3.5

        // ===== ITEMS =====
        doc.setFontSize(6.5)
        if (items.length === 0) {
          doc.setFont('Roboto', 'normal')
          doc.setTextColor(120)
          doc.text('No items available', pageWidth / 2, y, { align: 'center' })
          doc.setTextColor(0)
          y += rowHeight * 2
        } else {
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const rowY = y
            const productName = this.getProductName(item)
            
            const tempLines = tempDoc.splitTextToSize(productName, colItemWidth)
            const requiredHeight = tempLines.length * rowHeight 
            
            if (i % 2 === 0) {
              doc.setFillColor(252, 252, 252)
              doc.rect(margin, rowY - 2, contentWidth, requiredHeight, 'F')
            }

            doc.setFont('Roboto', 'normal')
            doc.text(String(i + 1), colNo, rowY) 
            doc.text(String(item.quantity ?? 0), colQty, rowY, { align: 'center' })
            
            const unitPrice = this.getUnitPrice(item)
            doc.text(this.formatCurrency(unitPrice, false), colPrice, rowY, { align: 'left' })
            
            doc.setFont('Roboto', 'bold')
            const itemTotal = this.getItemTotal(item)
            doc.text(`₦ ${this.formatCurrency(itemTotal, false)}`, colTotal, rowY, { align: 'left' })

            doc.setFont('Roboto', 'normal')
            const lines = doc.splitTextToSize(productName, colItemWidth) 
            let lineY = rowY
            for (const line of lines) {
              doc.text(line, colItem, lineY)
              lineY += rowHeight
            }

            y = rowY + requiredHeight
          }
        }

        // ===== TOTALS & FOOTER (Logic unchanged, references updated) =====
        doc.line(margin, y - 1, pageWidth - margin, y - 1)
        y += 3.5
        
        // --- CALCULATION FOR ALIGNMENT ---
        doc.setFontSize(8)
        doc.setFont('Roboto', 'bold')
        const finalAmountText = this.formatCurrency(inventory.total ?? 0, true) 
        
        const nairaSymbolWidth = doc.getTextWidth('₦')
        const finalAmountWidth = doc.getTextWidth(finalAmountText)
        
        totalValueStart = contentRightEdge - finalAmountWidth - nairaSymbolWidth - nairaSpacing
        // ---------------------------------

        doc.setFontSize(7)
        doc.setFont('Roboto', 'normal')

        // Subtotal
        doc.text('Subtotal:', totalsLabelX, y, { align: 'right' })
        const subtotalText = `₦ ${this.formatCurrency(inventory.subtotal ?? 0, true)}`
        doc.text(subtotalText, totalValueStart, y, { align: 'left' })
        y += 3.5

        // Discount
        if ((inventory.discount ?? 0) > 0) {
          doc.setTextColor(220, 0, 0)
          doc.text('Discount:', totalsLabelX, y, { align: 'right' })
          const discountText = `-₦ ${this.formatCurrency(inventory.discount ?? 0, true)}`
          doc.text(discountText, totalValueStart, y, { align: 'left' })
          doc.setTextColor(0, 0, 0)
          y += 3.5
        }

        // Tax
        doc.text('Tax:', totalsLabelX, y, { align: 'right' })
        const taxText = `₦ ${this.formatCurrency(inventory.tax ?? 0, true)}`
        doc.text(taxText, totalValueStart, y, { align: 'left' })
        y += 3.5

        // Grand Total Box
        doc.setFillColor(245, 245, 245)
        doc.rect(margin, y - 2.5, contentWidth, 5, 'F')
        doc.setFontSize(8)
        doc.setFont('Roboto', 'bold')
        doc.text('TOTAL:', totalsLabelX, y + 0.5, { align: 'right' })

        // Grand Total Amount
        doc.setFont('Roboto', 'normal')
        doc.text('₦', totalValueStart, y + 0.5, { align: 'left' }) 
        
        doc.setFont('Roboto', 'bold')
        doc.text(finalAmountText, totalValueStart + nairaSymbolWidth + nairaSpacing, y + 0.5, { align: 'left' }) 

        y += 5
        doc.line(margin, y + 1, pageWidth - margin, y + 1)
        y += 4.5
        doc.setFontSize(7)
        doc.setFont('Roboto', 'italic')
        doc.text('Thank you for coming!', pageWidth / 2, y, { align: 'center' })
        y += 4.0
        doc.setFontSize(6.5)
        doc.setFont('Roboto', 'normal')
        doc.text('www.pharmacy.com', pageWidth / 2, y, { align: 'center' })

        // Output
        this.invoicePDFDataURL = doc.output('dataurlstring')
        this.showPreview = true

        console.log('✅ Invoice PDF generated successfully')
      } catch (err) {
        console.error('❌ Failed generating invoice PDF:', err)
        this.inventoryError = 'Failed to generate PDF: ' + (err as Error).message
      } finally {
        this.isGenerating = false
      }
    },

    clearInvoice() {
      this.invoicePDFDataURL = null
      this.showPreview = false
    },

  },

  getters: {
    isModalOpen: (state) => state.modalType !== null,
  },
})