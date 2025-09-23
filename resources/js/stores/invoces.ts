// import { defineStore } from 'pinia'
// import { jsPDF } from 'jspdf'
// import logo from '@/assets/images/logo.png'
// import companyStamp from '@/assets/images/company-stamp.png'
// import signature from '@/assets/images/signature.png'

// export interface InventoryItem {
//   id: string
//   product_id: string
//   product_name: string
//   quantity: number
//   unit_price: number
//   total: number
// }

// export interface Inventory {
//   id: string
//   invoice_number: string
//   type: 'sale' | 'purchase' | 'return' | 'adjustment'
//   user_id: string
//   store_id: string
//   subtotal: number
//   discount: number
//   tax: number
//   total: number
//   payment_method: string
//   status: 'pending' | 'completed' | 'cancelled'
//   items: InventoryItem[]
//   user?: { name: string; email: string }
//   store?: { name: string; address: string; phone: string }
//   created_at: string
//   updated_at: string
// }

// interface InvoiceState {
//   currentInvoice: Inventory | null
//   isGeneratingPDF: boolean
//   invoicePDFDataURL: string | null
// }

// export const useInvoiceStore = defineStore('invoice', {
//   state: (): InvoiceState => ({
//     currentInvoice: null,
//     isGeneratingPDF: false,
//     invoicePDFDataURL: null
//   }),

//   actions: {
//     async generateInvoice(inventory: Inventory) {
//       this.isGeneratingPDF = true
//       this.currentInvoice = inventory
//       try {
//         const doc = new jsPDF({
//           orientation: 'portrait',
//           unit: 'mm',
//           format: [80, 297] // Thermal printer size
//         })

//         const logoImg = await this.getImageAsBase64(logo)
//         const stampImg = await this.getImageAsBase64(companyStamp)
//         const signImg = await this.getImageAsBase64(signature)

//         await this.addInvoiceContentToPDF(doc, inventory, logoImg, stampImg, signImg)

//         // Instead of saving, open in browser as a side panel
//         const dataURL = doc.output('dataurlstring')
//         this.invoicePDFDataURL = dataURL

//       } catch (error) {
//         console.error('Error generating invoice PDF:', error)
//         this.invoicePDFDataURL = null
//       } finally {
//         this.isGeneratingPDF = false
//       }
//     },

//     async addInvoiceContentToPDF(
//       doc: jsPDF,
//       inventory: Inventory,
//       logoImg: string,
//       stampImg: string,
//       signImg: string
//     ) {
//       const pageWidth = doc.internal.pageSize.getWidth()
//       let yPos = 5

//       doc.setFont('helvetica', 'normal')
//       doc.setFontSize(10)

//       // Header
//       doc.text('PHARMACY STORE', pageWidth / 2, yPos, { align: 'center' })
//       yPos += 4
//       doc.setFontSize(8)
//       doc.text('123 Medical Street, City', pageWidth / 2, yPos, { align: 'center' })
//       yPos += 3
//       doc.text('Phone: (123) 456-7890', pageWidth / 2, yPos, { align: 'center' })
//       yPos += 4

//       doc.line(2, yPos, pageWidth - 2, yPos)
//       yPos += 4

//       // Invoice Info
//       doc.setFontSize(9)
//       doc.text(`Invoice: ${inventory.invoice_number}`, 2, yPos)
//       doc.text(`Date: ${new Date(inventory.created_at).toLocaleString()}`, pageWidth - 2, yPos, { align: 'right' })
//       yPos += 4

//       // Items
//       doc.setFont(undefined, 'bold')
//       doc.text('QTY', 2, yPos)
//       doc.text('DESCRIPTION', 15, yPos)
//       doc.text('PRICE', pageWidth - 25, yPos, { align: 'right' })
//       doc.text('TOTAL', pageWidth - 2, yPos, { align: 'right' })
//       yPos += 3
//       doc.setFont(undefined, 'normal')

//       inventory.items.forEach(item => {
//         doc.text(item.quantity.toString(), 2, yPos)
//         doc.text(item.product_name, 15, yPos)
//         doc.text(item.unit_price.toFixed(2), pageWidth - 25, yPos, { align: 'right' })
//         doc.text(item.total.toFixed(2), pageWidth - 2, yPos, { align: 'right' })
//         yPos += 4
//       })

//       doc.line(2, yPos, pageWidth - 2, yPos)
//       yPos += 4

//       // Totals
//       doc.setFont(undefined, 'bold')
//       doc.text(`Subtotal: ${inventory.subtotal.toFixed(2)}`, pageWidth - 2, yPos, { align: 'right' })
//       yPos += 3
//       if (inventory.discount > 0) {
//         doc.text(`Discount: -${inventory.discount.toFixed(2)}`, pageWidth - 2, yPos, { align: 'right' })
//         yPos += 3
//       }
//       if (inventory.tax > 0) {
//         doc.text(`Tax: ${inventory.tax.toFixed(2)}`, pageWidth - 2, yPos, { align: 'right' })
//         yPos += 3
//       }
//       doc.text(`Total: ${inventory.total.toFixed(2)}`, pageWidth - 2, yPos, { align: 'right' })
//     },

//     async getImageAsBase64(imgUrl: string): Promise<string> {
//       return new Promise(resolve => {
//         const img = new Image()
//         img.crossOrigin = 'Anonymous'
//         img.onload = () => {
//           const canvas = document.createElement('canvas')
//           canvas.width = img.width
//           canvas.height = img.height
//           const ctx = canvas.getContext('2d')
//           if (ctx) ctx.drawImage(img, 0, 0)
//           resolve(canvas.toDataURL('image/png'))
//         }
//         img.src = imgUrl
//       })
//     },

//     clearInvoice() {
//       this.currentInvoice = null
//       this.invoicePDFDataURL = null
//     }
//   }
// })


import { defineStore } from 'pinia'
import { jsPDF } from 'jspdf'
import logo from '@/assets/images/logo.png'
import companyStamp from '@/assets/images/logo.png'
import signature from '@/assets/images/logo.png'

export interface InventoryItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
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
  items: InventoryItem[]
}

interface InvoiceState {
  invoicePDFDataURL: string | null
  isGenerating: boolean
}

export const useInvoiceStore = defineStore('invoice', {
  state: (): InvoiceState => ({
    invoicePDFDataURL: null,
    isGenerating: false
  }),
  actions: {
    async generateInvoice(inventory: Inventory) {
      this.isGenerating = true
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [80, 297]
        })

        const logoImg = await this.getImageAsBase64(logo)
        const stampImg = await this.getImageAsBase64(companyStamp)
        const signImg = await this.getImageAsBase64(signature)

        let y = 5
        const w = doc.internal.pageSize.getWidth()
        doc.setFontSize(10)
        doc.setFont(undefined, 'bold')
        doc.text('PHARMACY STORE', w/2, y, { align: 'center' })
        y += 4
        doc.setFontSize(8)
        doc.setFont(undefined, 'normal')
        doc.text('123 Medical Street, City', w/2, y, { align: 'center' })
        y += 3
        doc.text('Phone: (123) 456-7890', w/2, y, { align: 'center' })
        y += 5

        // invoice info
        doc.setFont(undefined, 'bold')
        doc.text(`Invoice: ${inventory.invoice_number}`, 5, y)
        doc.text(`Staff: ${inventory.user?.name || 'N/A'}`, w - 5, y, { align: 'right' })
        y += 4
        doc.setFont(undefined, 'normal')
        doc.text(`Type: ${inventory.type.toUpperCase()}`, 5, y)
        doc.text(`Payment: ${inventory.payment_method}`, w - 5, y, { align: 'right' })
        y += 4

        // Items
        doc.setFont(undefined, 'bold')
        doc.text('QTY', 5, y)
        doc.text('DESC', 20, y)
        doc.text('PRICE', w-25, y, { align: 'right' })
        doc.text('TOTAL', w-5, y, { align: 'right' })
        y += 3
        doc.setFont(undefined, 'normal')
        inventory.items.forEach(item => {
          doc.text(String(item.quantity), 5, y)
          doc.text(item.product_name, 20, y)
          doc.text(item.unit_price.toFixed(2), w-25, y, { align: 'right' })
          doc.text(item.total.toFixed(2), w-5, y, { align: 'right' })
          y += 4
        })

        y += 2
        doc.setFont(undefined, 'bold')
        doc.text('Subtotal:', w-25, y, { align: 'right' })
        doc.text(inventory.subtotal.toFixed(2), w-5, y, { align: 'right' })
        y += 4
        if (inventory.discount > 0) {
          doc.text('Discount:', w-25, y, { align: 'right' })
          doc.text(`-${inventory.discount.toFixed(2)}`, w-5, y, { align: 'right' })
          y += 4
        }
        if (inventory.tax > 0) {
          doc.text('Tax:', w-25, y, { align: 'right' })
          doc.text(inventory.tax.toFixed(2), w-5, y, { align: 'right' })
          y += 4
        }
        doc.text('TOTAL:', w-25, y, { align: 'right' })
        doc.text(inventory.total.toFixed(2), w-5, y, { align: 'right' })

        // Convert to data URL for iframe
        this.invoicePDFDataURL = doc.output('dataurlstring')
      } catch (err) {
        console.error('Failed generating invoice PDF', err)
      } finally {
        this.isGenerating = false
      }
    },

    clearInvoice() {
      this.invoicePDFDataURL = null
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
        img.src = url
      })
    }
  }
})
