import { defineStore } from 'pinia'
import { jsPDF } from 'jspdf'
import axios from 'axios'
import logo from '@/assets/images/logo.jpg'
import robotoFont from '@/assets/fonts/Roboto.ttf'
import robotoBoldFont from '@/assets/fonts/Roboto-Bold.ttf'
import { usePage } from '@inertiajs/vue3'

// Types
export interface InventoryItem {
  id: string
  product_id: string
  product_name?: string
  name?: string
  product?: { name: string }
  quantity: number
  unit_price: number
  price?: number
  total: number
}

export interface Inventory {
  id: string
  invoice_number: string
  type: string
  user?: { name: string }
  payment_method: string
  status: string
  subtotal: number
  discount: number
  tax: number
  total: number
  items?: InventoryItem[]
  inventory_items?: InventoryItem[]
  created_at?: string
}

export interface InvoiceState {
  invoicePDFDataURL: string | null
  isGenerating: boolean
  showPreview: boolean
}

export interface InventoryState {
  inventories: Inventory[]
  pagination: { links: any; meta: any } | null
  modalType: string | null
  selected: Inventory | null
  search: string
  loading: boolean
  error: string | null
  customerOptions: { label: string; value: string }[]
  storeOptions: { label: string; value: string }[]
  hasSingleStore: boolean
  optionsInitialized: boolean
}

interface CombinedState extends InventoryState, InvoiceState {}

export const useInventory = defineStore('inventory', {
  state: (): CombinedState => ({
    // Inventory-related state
    inventories: [],
    pagination: null,
    modalType: null,
    selected: null,
    search: '',
    loading: false,
    error: null,

    // Options
    customerOptions: [],
    storeOptions: [],
    hasSingleStore: false,
    optionsInitialized: false,

    // Invoice-related state
    invoicePDFDataURL: null,
    isGenerating: false,
    showPreview: false,
  }),

  actions: {
    // ---------- Inventory helpers ----------
    async fetchInventories(page: number = 1) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get(route('inventories.index'), {
          params: { page, search: this.search },
        })
        this.inventories = data.inventories?.data || []
        this.pagination = {
          links: data.inventories?.links,
          meta: data.inventories?.meta,
        }
      } catch (err: any) {
        console.error('Error fetching inventories:', err)
        this.error = err.message || 'Failed loading inventories'
      } finally {
        this.loading = false
      }
    },

    async deleteInventory(id: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.delete(route('inventory.delete', id))
        if (data.status) {
          this.inventories = this.inventories.filter((s) => s.id !== id)
          this.closeModal()
          await this.fetchInventories()
        } else {
          this.error = data.message || 'Failed to delete inventory'
        }
      } catch (error: any) {
        console.error('Error deleting inventory:', error)
        this.error = error.message || 'Failed to delete inventory'
      } finally {
        this.loading = false
      }
    },

    resetSearch() {
      this.search = ''
      this.fetchInventories(1)
    },

    openModal(type: string, payload: Inventory | null = null) {
      console.log('📂 Opening modal:', type, payload)
      this.modalType = type
      this.selected = payload
    },

    closeModal() {
      console.log('🚪 Closing inventory modal')
      this.modalType = null
      this.selected = null
    },

    addLocal(inventory: Inventory) {
      this.inventories.unshift(inventory)
    },

    updateLocal(updated: Inventory) {
      const idx = this.inventories.findIndex((i) => i.id === updated.id)
      if (idx !== -1) this.inventories[idx] = updated
    },

    removeLocal(id: string) {
      this.inventories = this.inventories.filter((i) => i.id !== id)
    },

    // ---------- Options management ----------
    async initializeOptions() {
      try {
        const user = usePage().props.auth?.user

        const [customerRes, storeRes] = await Promise.all([
          axios.get(route('customers.api')),
          axios.get(route('stores.api')),
        ])        

        this.customerOptions = (customerRes.data?.customers ?? []).map((c: any) => ({
          label: c.name,
          value: String(c.id),
        }))

        let stores = storeRes.data?.stores || storeRes.data || []
        if (!Array.isArray(stores)) stores = []

        this.storeOptions = stores.map((s: any) => ({
          label: s.name,
          value: String(s.id),
        }))

        if (user?.stores?.length === 1) {
          this.hasSingleStore = true
        }

        this.optionsInitialized = true
      } catch (err) {
        console.error('Options loading error', err)
        this.error = 'Failed to load options'
      }
    },

    // ---------- Invoice generation (LOCAL) ----------
    // This is your jsPDF-based generateInvoice (kept local — not a backend call).
    async generateInvoice(inventory: Inventory, servedBy?: string, customerName?: string) {
      this.isGenerating = true

      // Define constants for layout
      const pageWidth = 80
      const margin = 4
      const contentWidth = pageWidth - 2 * margin
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
      const contentRightEdge = pageWidth - margin

      const detailValueOffset = 25
      const detailTitleX = margin + 1

      const items = inventory.items || inventory.inventory_items || []
      let font: string = ''
      let boldFont: string = ''
      let logoImg: string = ''

      let totalValueStart: number = 0
      const nairaSpacing = 0.5

      // helper functions
      const formatCurrency = (amount: number, useDecimals: boolean = true): string => {
        const options: Intl.NumberFormatOptions = {
          minimumFractionDigits: useDecimals ? 2 : 0,
          maximumFractionDigits: useDecimals ? 2 : 0,
          useGrouping: true,
        }
        return new Intl.NumberFormat('en-NG', options).format(amount)
      }

      const formatDateTime = (dateString?: string): string => {
        const date = dateString ? new Date(dateString) : new Date()
        const dateOptions: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
        const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: true }
        const formattedDate = date.toLocaleDateString('en-GB', dateOptions)
        const formattedTime = date.toLocaleTimeString('en-US', timeOptions)
        return `${formattedDate} ${formattedTime}`
      }

      const capitalizeFirstLetter = (str?: string): string =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : 'N/A'
      
      const getProductName = (item: any): string =>
        item.product_name || item.name || `${item.product?.name} - ${item.product?.brand}` || 'Unknown Product'

      const getUnitPrice = (item: any): number =>
        item.unit_price || item.price || 0

      const getItemTotal = (item: any): number =>
        item.total && item.total > 0 ? item.total : (item.quantity || 0) * getUnitPrice(item)

      const truncateText = (text: string, maxWidth: number, fontSize: number): string => {
        const tempDoc = new jsPDF()
        tempDoc.setFontSize(fontSize)
        const textWidth = tempDoc.getTextWidth(text)
        if (textWidth <= maxWidth) return text
        let truncated = text
        while (tempDoc.getTextWidth(truncated + '...') > maxWidth && truncated.length > 0) {
          truncated = truncated.slice(0, -1)
        }
        return truncated + '...'
      }

      try {
        // 1. Load Assets & Register Font Data
        const robotoFontResponse = await fetch(robotoFont)
        const robotoFontBuffer = await robotoFontResponse.arrayBuffer()
        font = new Uint8Array(robotoFontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')

        const robotoBoldFontResponse = await fetch(robotoBoldFont)
        const robotoBoldFontBuffer = await robotoBoldFontResponse.arrayBuffer()
        boldFont = new Uint8Array(robotoBoldFontBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')

        logoImg = await this.getImageAsBase64(logo)

        // 2. Calculate Actual Total Height (for DYNAMIC page sizing)
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
          const productName = getProductName(item)
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

        // 3. Create Final PDF Document
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

        // 4. Start Drawing Content
        let y = 6

        // Header and Business Info
        const logoX = (pageWidth - logoHeight) / 2
        doc.addImage(logoImg, 'PNG', logoX, y, logoHeight, logoHeight)
        y += logoHeight + 3

        doc.setFontSize(11)
        doc.setFont('Roboto', 'bold')
        doc.text('DYK SUPER STORE LTD', pageWidth / 2, y, { align: 'center' })
        y += 4

        doc.setFontSize(7)
        doc.setFont('Roboto', 'normal')
        doc.text('Justice Quarters, Opp. Dogon Yaro Roundabout GRA, Bauchi', pageWidth / 2, y, { align: 'center' })
        y += 3
        doc.text('Phone: 08073181971, 07031545880', pageWidth / 2, y, { align: 'center' })
        y += 3
        doc.text('Email: info.dyksuperstore@gmail.com', pageWidth / 2, y, { align: 'center' })
        y += 4

        doc.setLineWidth(0.2)
        doc.line(margin, y, pageWidth - margin, y)
        y += 3

        // --- INVOICE INFO SECTION ---
        const details = [
          { label: 'Invoice No:', value: inventory.invoice_number ?? 'N/A' },
          { label: 'Date:', value: formatDateTime(inventory.created_at) },
          { label: 'Served By:', value: servedBy ?? inventory.user?.name ?? 'N/A' },
          { label: 'Customer:', value: customerName ?? 'Walk-in' },
          { label: 'Payment Method:', value: capitalizeFirstLetter(inventory.payment_method) },
        ]

        doc.setFontSize(7)
        details.forEach((detail) => {
          doc.setFont('Roboto', 'bold')
          doc.text(detail.label, detailTitleX, y)
          doc.setFont('Roboto', 'normal')
          const valueText = truncateText(detail.value, contentWidth - detailValueOffset - 5, 7)
          doc.text(valueText, margin + detailValueOffset, y)
          y += 3.5
        })

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
            const productName = getProductName(item)

            const tempLines = tempDoc.splitTextToSize(productName, colItemWidth)
            const requiredHeight = tempLines.length * rowHeight

            if (i % 2 === 0) {
              doc.setFillColor(252, 252, 252)
              doc.rect(margin, rowY - 2, contentWidth, requiredHeight, 'F')
            }

            doc.setFont('Roboto', 'normal')
            doc.text(String(i + 1), colNo, rowY)
            doc.text(String(item.quantity ?? 0), colQty, rowY, { align: 'center' })

            const unitPrice = getUnitPrice(item)
            doc.text(formatCurrency(unitPrice, false), colPrice, rowY, { align: 'left' })

            doc.setFont('Roboto', 'bold')
            const itemTotal = getItemTotal(item)
            doc.text(`₦ ${formatCurrency(itemTotal, false)}`, colTotal, rowY, { align: 'left' })

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

        // ===== TOTALS & FOOTER =====
        doc.line(margin, y - 1, pageWidth - margin, y - 1)
        y += 3.5

        // --- CALCULATION FOR ALIGNMENT ---
        doc.setFontSize(8)
        doc.setFont('Roboto', 'bold')
        const finalAmountText = formatCurrency(inventory.total ?? 0, true)

        const nairaSymbolWidth = doc.getTextWidth('₦')
        const finalAmountWidth = doc.getTextWidth(finalAmountText)

        totalValueStart = contentRightEdge - finalAmountWidth - nairaSymbolWidth - nairaSpacing

        doc.setFontSize(7)
        doc.setFont('Roboto', 'normal')

        // Subtotal
        doc.text('Subtotal:', totalsLabelX, y, { align: 'right' })
        const subtotalText = `₦ ${formatCurrency(inventory.subtotal ?? 0, true)}`
        doc.text(subtotalText, totalValueStart, y, { align: 'left' })
        y += 3.5

        // Discount
        if ((inventory.discount ?? 0) > 0) {
          doc.setTextColor(220, 0, 0)
          doc.text('Discount:', totalsLabelX, y, { align: 'right' })
          const discountText = `-₦ ${formatCurrency(inventory.discount ?? 0, true)}`
          doc.text(discountText, totalValueStart, y, { align: 'left' })
          doc.setTextColor(0, 0, 0)
          y += 3.5
        }

        // Tax
        doc.text('Tax:', totalsLabelX, y, { align: 'right' })
        const taxText = `₦ ${formatCurrency(inventory.tax ?? 0, true)}`
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
        doc.text('Powered by: AFGICafe | +2347031545880', pageWidth / 2, y, { align: 'center' })

        // Output and State Update
        this.invoicePDFDataURL = doc.output('dataurlstring')
        this.showPreview = true

        console.log('✅ Invoice PDF generated successfully')
      } catch (err) {
        console.error('❌ Failed generating invoice PDF:', err)
      } finally {
        this.isGenerating = false
      }
    },

    clearInvoice() {
      this.invoicePDFDataURL = null
      this.showPreview = false
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

    // Optional small helper: prepare customer field for payload if you want to use store-level create/update
    prepareCustomerForPayload(customerValue?: string | null) {
      const value = (customerValue || '').toString().trim()
      if (!value) return { customer: null }
      const existing = this.customerOptions.find((c) => c.value === value || c.label === value)
      return { customer: existing ? existing.value : value }
    },

    async fetchInvoice(id: string | { id?: string; inventory?: string }) {
      this.isGenerating = true
      this.error = null

      try {
        const inventoryId =
          typeof id === 'object'
            ? (id.inventory || id.id)
            : id

        console.log("ID " + inventoryId);
        

        const { data } = await axios.get(route('inventories.show', { inventory: inventoryId }))
        console.log("DATA " + data);


        const inv: Inventory = data.inventory || data

        // 🧠 Normalize items
        let items = inv.items || inv.inventory_items || []
        if (inv.inventory && inv.inventory.inventory_items) {
          items = inv.inventory.inventory_items
        }

        inv.items = items

        const servedBy = inv.user?.name || usePage().props.auth?.user?.name || 'N/A'
        const customerName = (inv as any).customer?.name || (inv as any).customer_name || 'Walk-in'

        await this.generateInvoice(inv, servedBy, customerName)
      } catch (err: any) {
        console.error('❌ Error fetching and generating invoice:', err)
        this.error = err.message || 'Failed to fetch and generate invoice.'
      } finally {
        this.isGenerating = false
      }
    }
  },

  getters: {
    isModalOpen: (state) => state.modalType !== null,

    filteredInventories: (state) => {
      if (!state.search) return state.inventories
      return state.inventories.filter((inv) =>
        (inv.invoice_number || '').toLowerCase().includes(state.search.toLowerCase()) ||
        ((inv as any).customer_name || '').toLowerCase().includes(state.search.toLowerCase())
      )
    },

    getInventoryById: (state) => (id: string) => {
      return state.inventories.find((inv) => inv.id === id)
    },

    totalInventoryValue: (state) => {
      return state.inventories.reduce((total, inv) => total + (inv.total || 0), 0)
    },

    defaultStoreId: (state) => {
      const user = usePage().props.auth?.user
      if (user?.stores?.length === 1) {
        return String(user.stores[0].id)
      }
      return state.storeOptions[0]?.value || ''
    },

    paymentMethods: () => [
      { label: 'Cash', value: 'cash' },
      { label: 'POS', value: 'pos' },
      { label: 'Transfer', value: 'transfer' },
    ],
  },
})