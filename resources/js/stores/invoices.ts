// BROWSER WINDOW
// import { defineStore } from 'pinia'
// import { jsPDF } from 'jspdf'
// import logo from '@/assets/images/logo.jpg'
// import companyStamp from '@/assets/images/logo.jpg'
// import signature from '@/assets/images/logo.jpg'

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
//   type: string
//   user?: { name: string }
//   payment_method: string
//   status: string
//   subtotal: number
//   discount: number
//   tax: number
//   total: number
//   items: InventoryItem[]
// }

// interface InvoiceState {
//   invoicePDFDataURL: string | null
//   isGenerating: boolean
//   showPreview: boolean
// }

// export const useInvoice = defineStore('invoice', {
//   state: (): InvoiceState => ({
//     invoicePDFDataURL: null,
//     isGenerating: false,
//     showPreview: false,
//   }),

//   actions: {
//     async generateInvoice(inventory: Inventory) {
//       this.isGenerating = true
//       try {
//         const doc = new jsPDF({
//           orientation: 'portrait',
//           unit: 'mm',
//           format: [80, 297], // thermal receipt size
//         })

//         const logoImg = await this.getImageAsBase64(logo)
//         const stampImg = await this.getImageAsBase64(companyStamp)
//         const signImg = await this.getImageAsBase64(signature)

//         let y = 5
//         const w = doc.internal.pageSize.getWidth()

//         // HEADER
//         doc.setFontSize(10)
//         doc.setFont(undefined, 'bold')
//         doc.text('PHARMACY STORE', w / 2, y, { align: 'center' })
//         y += 4
//         doc.setFontSize(8)
//         doc.setFont(undefined, 'normal')
//         doc.text('123 Medical Street, City', w / 2, y, { align: 'center' })
//         y += 3
//         doc.text('Phone: (123) 456-7890', w / 2, y, { align: 'center' })
//         y += 5

//         // INVOICE DETAILS
//         doc.setFont(undefined, 'bold')
//         doc.text(`Invoice: ${inventory.invoice_number ?? ''}`, 5, y)
//         doc.text(`Staff: ${inventory.user?.name ?? 'N/A'}`, w - 5, y, { align: 'right' })
//         y += 4
//         doc.setFont(undefined, 'normal')
//         doc.text(`Type: ${(inventory.type ?? '').toUpperCase()}`, 5, y)
//         doc.text(`Payment: ${inventory.payment_method ?? ''}`, w - 5, y, { align: 'right' })
//         y += 4

//         // TABLE HEADER
//         doc.setFont(undefined, 'bold')
//         doc.text('QTY', 5, y)
//         doc.text('DESC', 20, y)
//         doc.text('PRICE', w - 25, y, { align: 'right' })
//         doc.text('TOTAL', w - 5, y, { align: 'right' })
//         y += 3

//         // ITEMS
//         doc.setFont(undefined, 'normal')
//         for (const item of inventory.items) {
//           const qty = String(item.quantity ?? '')
//           const name = String(item.product_name ?? '')
//           const price = (item.unit_price ?? 0).toFixed(2)
//           const total = (item.total ?? 0).toFixed(2)

//           doc.text(qty, 5, y)
//           doc.text(name, 20, y)
//           doc.text(price, w - 25, y, { align: 'right' })
//           doc.text(total, w - 5, y, { align: 'right' })
//           y += 4
//         }

//         // TOTALS
//         y += 2
//         doc.setFont(undefined, 'bold')
//         doc.text('Subtotal:', w - 25, y, { align: 'right' })
//         doc.text(String(inventory.subtotal?.toFixed(2) ?? '0.00'), w - 5, y, { align: 'right' })
//         y += 4

//         if ((inventory.discount ?? 0) > 0) {
//           doc.text('Discount:', w - 25, y, { align: 'right' })
//           doc.text(`-${inventory.discount?.toFixed(2)}`, w - 5, y, { align: 'right' })
//           y += 4
//         }

//         if ((inventory.tax ?? 0) > 0) {
//           doc.text('Tax:', w - 25, y, { align: 'right' })
//           doc.text(String(inventory.tax?.toFixed(2)), w - 5, y, { align: 'right' })
//           y += 4
//         }

//         doc.text('TOTAL:', w - 25, y, { align: 'right' })
//         doc.text(String(inventory.total?.toFixed(2) ?? '0.00'), w - 5, y, { align: 'right' })

//         // ✅ Open in a small popup with visible print button
//         const pdfBlob = doc.output('blob')
//         const pdfURL = URL.createObjectURL(pdfBlob)
//         const popupWidth = 500
//         const popupHeight = 700
//         const left = window.screenX + (window.outerWidth - popupWidth) / 2
//         const top = window.screenY + (window.outerHeight - popupHeight) / 2

//         const popup = window.open(
//           '',
//           'InvoicePopup',
//           `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=no`
//         )

//         if (popup) {
//           popup.document.write(`
//             <html>
//               <head>
//                 <title>Invoice Preview</title>
//                 <style>
//                   body {
//                     margin: 0;
//                     padding: 0;
//                     background: #f4f4f4;
//                     display: flex;
//                     flex-direction: column;
//                     height: 100vh;
//                   }
//                   #toolbar {
//                     background: #0f172a;
//                     color: #fff;
//                     padding: 8px 10px;
//                     text-align: right;
//                   }
//                   #toolbar button {
//                     background: #22c55e;
//                     border: none;
//                     color: #fff;
//                     font-weight: bold;
//                     padding: 6px 12px;
//                     border-radius: 6px;
//                     cursor: pointer;
//                   }
//                   iframe {
//                     flex: 1;
//                     width: 100%;
//                     border: none;
//                   }
//                 </style>
//               </head>
//               <body>
//                 <div id="toolbar">
//                   <button onclick="document.getElementById('pdfFrame').contentWindow.print()">🖨️ Print Invoice</button>
//                 </div>
//                 <iframe id="pdfFrame" src="${pdfURL}"></iframe>
//               </body>
//             </html>
//           `)
//           popup.document.close()
//         }

//         this.invoicePDFDataURL = pdfURL
//         this.showPreview = false
//       } catch (err) {
//         console.error('❌ Failed generating invoice PDF', err)
//       } finally {
//         this.isGenerating = false
//       }
//     },

//     clearInvoice() {
//       this.invoicePDFDataURL = null
//       this.showPreview = false
//     },

//     async getImageAsBase64(url: string) {
//       return new Promise<string>((resolve) => {
//         const img = new Image()
//         img.crossOrigin = 'Anonymous'
//         img.onload = () => {
//           const canvas = document.createElement('canvas')
//           canvas.width = img.width
//           canvas.height = img.height
//           const ctx = canvas.getContext('2d')
//           ctx?.drawImage(img, 0, 0)
//           resolve(canvas.toDataURL('image/png'))
//         }
//         img.src = url
//       })
//     },
//   },
// })










// COLOR INVOICE
// import { defineStore } from 'pinia'
// import { jsPDF } from 'jspdf'
// import logo from '@/assets/images/logo.jpg'
// import companyStamp from '@/assets/images/logo.jpg'
// import signature from '@/assets/images/logo.jpg'

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
//   type: string
//   user?: { name: string }
//   payment_method: string
//   status: string
//   subtotal: number
//   discount: number
//   tax: number
//   total: number
//   items: InventoryItem[]
// }

// interface InvoiceState {
//   invoicePDFDataURL: string | null
//   isGenerating: boolean
//   showPreview: boolean
// }

// export const useInvoice = defineStore('invoice', {
//   state: (): InvoiceState => ({
//     invoicePDFDataURL: null,
//     isGenerating: false,
//     showPreview: false,
//   }),

//   actions: {
//     async generateInvoice(inventory: Inventory) {
//       this.isGenerating = true
//       try {
//         const doc = new jsPDF({
//           orientation: 'portrait',
//           unit: 'mm',
//           format: 'a4',
//         })

//         const logoImg = await this.getImageAsBase64(logo)
//         const stampImg = await this.getImageAsBase64(companyStamp)
//         const signImg = await this.getImageAsBase64(signature)

//         const pageWidth = doc.internal.pageSize.getWidth()
//         const pageHeight = doc.internal.pageSize.getHeight()
//         const margin = 20

//         // BACKGROUND ACCENT - Modern touch
//         doc.setFillColor(41, 128, 185) // Professional blue
//         doc.rect(0, 0, pageWidth, 50, 'F')

//         // LOGO
//         if (logoImg) {
//           doc.addImage(logoImg, 'PNG', margin, 15, 30, 30)
//         }

//         // COMPANY HEADER
//         doc.setTextColor(255, 255, 255)
//         doc.setFontSize(24)
//         doc.setFont(undefined, 'bold')
//         doc.text('PHARMACY STORE', pageWidth - margin, 25, { align: 'right' })
        
//         doc.setFontSize(10)
//         doc.setFont(undefined, 'normal')
//         doc.text('123 Medical Street, City, State 12345', pageWidth - margin, 32, { align: 'right' })
//         doc.text('Phone: (123) 456-7890', pageWidth - margin, 37, { align: 'right' })
//         doc.text('Email: info@pharmacy.com', pageWidth - margin, 42, { align: 'right' })

//         // INVOICE TITLE
//         doc.setTextColor(0, 0, 0)
//         doc.setFontSize(28)
//         doc.setFont(undefined, 'bold')
//         doc.text('INVOICE', margin, 70)

//         // INVOICE INFO BOX
//         const infoBoxY = 80
//         doc.setFillColor(245, 245, 245)
//         doc.roundedRect(margin, infoBoxY, 80, 30, 2, 2, 'F')
        
//         doc.setFontSize(10)
//         doc.setFont(undefined, 'bold')
//         doc.setTextColor(60, 60, 60)
//         doc.text('Invoice Number:', margin + 5, infoBoxY + 8)
//         doc.text('Date:', margin + 5, infoBoxY + 15)
//         doc.text('Type:', margin + 5, infoBoxY + 22)
        
//         doc.setFont(undefined, 'normal')
//         doc.setTextColor(0, 0, 0)
//         doc.text(inventory.invoice_number ?? 'N/A', margin + 40, infoBoxY + 8)
//         doc.text(new Date().toLocaleDateString(), margin + 40, infoBoxY + 15)
//         doc.text((inventory.type ?? '').toUpperCase(), margin + 40, infoBoxY + 22)

//         // BILL TO / STAFF INFO
//         const rightBoxX = pageWidth - margin - 80
//         doc.roundedRect(rightBoxX, infoBoxY, 80, 30, 2, 2, 'F')
        
//         doc.setFont(undefined, 'bold')
//         doc.setTextColor(60, 60, 60)
//         doc.text('Served By:', rightBoxX + 5, infoBoxY + 8)
//         doc.text('Payment Method:', rightBoxX + 5, infoBoxY + 15)
//         doc.text('Status:', rightBoxX + 5, infoBoxY + 22)
        
//         doc.setFont(undefined, 'normal')
//         doc.setTextColor(0, 0, 0)
//         doc.text(inventory.user?.name ?? 'N/A', rightBoxX + 35, infoBoxY + 8)
//         doc.text(inventory.payment_method ?? 'N/A', rightBoxX + 35, infoBoxY + 15)
        
//         // Status with color
//         const statusColor = inventory.status?.toLowerCase() === 'paid' ? [46, 204, 113] : [231, 76, 60]
//         doc.setTextColor(statusColor[0], statusColor[1], statusColor[2])
//         doc.setFont(undefined, 'bold')
//         doc.text((inventory.status ?? 'PENDING').toUpperCase(), rightBoxX + 35, infoBoxY + 22)

//         // ITEMS TABLE
//         const tableStartY = 125
        
//         // Table Header
//         doc.setFillColor(41, 128, 185)
//         doc.rect(margin, tableStartY, pageWidth - 2 * margin, 10, 'F')
        
//         doc.setTextColor(255, 255, 255)
//         doc.setFontSize(11)
//         doc.setFont(undefined, 'bold')
//         doc.text('#', margin + 3, tableStartY + 7)
//         doc.text('DESCRIPTION', margin + 12, tableStartY + 7)
//         doc.text('QTY', pageWidth - margin - 70, tableStartY + 7, { align: 'center' })
//         doc.text('UNIT PRICE', pageWidth - margin - 45, tableStartY + 7, { align: 'right' })
//         doc.text('TOTAL', pageWidth - margin - 3, tableStartY + 7, { align: 'right' })

//         // Table Rows
//         let currentY = tableStartY + 15
//         doc.setTextColor(0, 0, 0)
//         doc.setFont(undefined, 'normal')
//         doc.setFontSize(10)

//         inventory.items.forEach((item, index) => {
//           // Alternate row colors
//           if (index % 2 === 0) {
//             doc.setFillColor(250, 250, 250)
//             doc.rect(margin, currentY - 5, pageWidth - 2 * margin, 8, 'F')
//           }

//           doc.text(String(index + 1), margin + 3, currentY)
          
//           // Truncate long product names
//           const productName = item.product_name ?? 'N/A'
//           const maxNameLength = 35
//           const displayName = productName.length > maxNameLength 
//             ? productName.substring(0, maxNameLength) + '...' 
//             : productName
//           doc.text(displayName, margin + 12, currentY)
          
//           doc.text(String(item.quantity ?? 0), pageWidth - margin - 70, currentY, { align: 'center' })
//           doc.text(`$${(item.unit_price ?? 0).toFixed(2)}`, pageWidth - margin - 45, currentY, { align: 'right' })
//           doc.text(`$${(item.total ?? 0).toFixed(2)}`, pageWidth - margin - 3, currentY, { align: 'right' })
          
//           currentY += 8
//         })

//         // Table bottom border
//         doc.setDrawColor(200, 200, 200)
//         doc.line(margin, currentY, pageWidth - margin, currentY)

//         // TOTALS SECTION
//         currentY += 10
//         const totalsX = pageWidth - margin - 60

//         doc.setFontSize(10)
//         doc.setFont(undefined, 'normal')
//         doc.text('Subtotal:', totalsX, currentY, { align: 'right' })
//         doc.text(`$${(inventory.subtotal ?? 0).toFixed(2)}`, pageWidth - margin - 3, currentY, { align: 'right' })
//         currentY += 6

//         if ((inventory.discount ?? 0) > 0) {
//           doc.setTextColor(231, 76, 60)
//           doc.text('Discount:', totalsX, currentY, { align: 'right' })
//           doc.text(`-$${(inventory.discount ?? 0).toFixed(2)}`, pageWidth - margin - 3, currentY, { align: 'right' })
//           doc.setTextColor(0, 0, 0)
//           currentY += 6
//         }

//         if ((inventory.tax ?? 0) > 0) {
//           doc.text('Tax:', totalsX, currentY, { align: 'right' })
//           doc.text(`$${(inventory.tax ?? 0).toFixed(2)}`, pageWidth - margin - 3, currentY, { align: 'right' })
//           currentY += 6
//         }

//         // Total with background
//         doc.setFillColor(41, 128, 185)
//         doc.roundedRect(totalsX - 5, currentY - 4, 65, 10, 2, 2, 'F')
        
//         doc.setTextColor(255, 255, 255)
//         doc.setFontSize(12)
//         doc.setFont(undefined, 'bold')
//         doc.text('TOTAL:', totalsX, currentY + 3, { align: 'right' })
//         doc.text(`$${(inventory.total ?? 0).toFixed(2)}`, pageWidth - margin - 3, currentY + 3, { align: 'right' })

//         // FOOTER SECTION
//         const footerY = pageHeight - 40

//         // Signature and Stamp
//         doc.setTextColor(0, 0, 0)
//         doc.setFontSize(9)
//         doc.setFont(undefined, 'normal')
        
//         if (signImg) {
//           doc.addImage(signImg, 'PNG', margin, footerY - 15, 25, 15)
//         }
//         doc.line(margin, footerY, margin + 40, footerY)
//         doc.text('Authorized Signature', margin, footerY + 5)

//         if (stampImg) {
//           doc.addImage(stampImg, 'PNG', pageWidth - margin - 30, footerY - 15, 25, 15)
//         }
//         doc.line(pageWidth - margin - 40, footerY, pageWidth - margin, footerY)
//         doc.text('Company Stamp', pageWidth - margin - 30, footerY + 5)

//         // Thank you message
//         doc.setFontSize(10)
//         doc.setFont(undefined, 'italic')
//         doc.setTextColor(100, 100, 100)
//         doc.text('Thank you for your business!', pageWidth / 2, footerY + 15, { align: 'center' })

//         // Footer bar
//         doc.setFillColor(41, 128, 185)
//         doc.rect(0, pageHeight - 15, pageWidth, 15, 'F')
//         doc.setTextColor(255, 255, 255)
//         doc.setFontSize(8)
//         doc.setFont(undefined, 'normal')
//         doc.text('www.pharmacy.com | Terms & Conditions Apply', pageWidth / 2, pageHeight - 8, { align: 'center' })

//         this.invoicePDFDataURL = doc.output('dataurlstring')
//         this.showPreview = true
//       } catch (err) {
//         console.error('❌ Failed generating invoice PDF', err)
//       } finally {
//         this.isGenerating = false
//       }
//     },

//     clearInvoice() {
//       this.invoicePDFDataURL = null
//       this.showPreview = false
//     },

//     async getImageAsBase64(url: string) {
//       return new Promise<string>((resolve) => {
//         const img = new Image()
//         img.crossOrigin = 'Anonymous'
//         img.onload = () => {
//           const canvas = document.createElement('canvas')
//           canvas.width = img.width
//           canvas.height = img.height
//           const ctx = canvas.getContext('2d')
//           ctx?.drawImage(img, 0, 0)
//           resolve(canvas.toDataURL('image/png'))
//         }
//         img.onerror = () => {
//           resolve('')
//         }
//         img.src = url
//       })
//     },
//   },
// })









// BLACK and WHITE
// import { defineStore } from 'pinia'
// import { jsPDF } from 'jspdf'
// import logo from '@/assets/images/logo.jpg'
// import companyStamp from '@/assets/images/logo.jpg'
// import signature from '@/assets/images/logo.jpg'

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
//   type: string
//   user?: { name: string }
//   payment_method: string
//   status: string
//   subtotal: number
//   discount: number
//   tax: number
//   total: number
//   items: InventoryItem[]
// }

// interface InvoiceState {
//   invoicePDFDataURL: string | null
//   isGenerating: boolean
//   showPreview: boolean
// }

// export const useInvoice = defineStore('invoice', {
//   state: (): InvoiceState => ({
//     invoicePDFDataURL: null,
//     isGenerating: false,
//     showPreview: false,
//   }),

//   actions: {
//     async generateInvoice(inventory: Inventory) {
//       this.isGenerating = true
//       try {
//         const doc = new jsPDF({
//           orientation: 'portrait',
//           unit: 'mm',
//           format: 'a4',
//         })

//         const logoImg = await this.getImageAsBase64(logo)
//         const stampImg = await this.getImageAsBase64(companyStamp)
//         const signImg = await this.getImageAsBase64(signature)

//         const pageWidth = doc.internal.pageSize.getWidth()
//         const pageHeight = doc.internal.pageSize.getHeight()
//         const margin = 20

//         // TOP BORDER LINE (minimal ink)
//         doc.setDrawColor(0, 0, 0)
//         doc.setLineWidth(1)
//         doc.line(margin, 15, pageWidth - margin, 15)

//         // LOGO
//         if (logoImg) {
//           doc.addImage(logoImg, 'PNG', margin, 20, 30, 30)
//         }

//         // COMPANY HEADER
//         doc.setTextColor(0, 0, 0)
//         doc.setFontSize(24)
//         doc.setFont(undefined, 'bold')
//         doc.text('PHARMACY STORE', pageWidth - margin, 25, { align: 'right' })
        
//         doc.setFontSize(9)
//         doc.setFont(undefined, 'normal')
//         doc.text('123 Medical Street, City, State 12345', pageWidth - margin, 32, { align: 'right' })
//         doc.text('Phone: (123) 456-7890', pageWidth - margin, 37, { align: 'right' })
//         doc.text('Email: info@pharmacy.com', pageWidth - margin, 42, { align: 'right' })

//         // HORIZONTAL LINE
//         doc.setLineWidth(0.5)
//         doc.line(margin, 52, pageWidth - margin, 52)

//         // INVOICE TITLE
//         doc.setFontSize(32)
//         doc.setFont(undefined, 'bold')
//         doc.text('INVOICE', margin, 65)

//         // INVOICE INFO BOX (borders only, no fill)
//         const infoBoxY = 75
//         doc.setDrawColor(0, 0, 0)
//         doc.setLineWidth(0.8)
//         doc.rect(margin, infoBoxY, 80, 30)
        
//         doc.setFontSize(10)
//         doc.setFont(undefined, 'bold')
//         doc.text('Invoice Number:', margin + 3, infoBoxY + 8)
//         doc.text('Date:', margin + 3, infoBoxY + 16)
//         doc.text('Type:', margin + 3, infoBoxY + 24)
        
//         doc.setFont(undefined, 'normal')
//         doc.text(inventory.invoice_number ?? 'N/A', margin + 38, infoBoxY + 8)
//         doc.text(new Date().toLocaleDateString(), margin + 38, infoBoxY + 16)
//         doc.text((inventory.type ?? '').toUpperCase(), margin + 38, infoBoxY + 24)

//         // STAFF INFO BOX
//         const rightBoxX = pageWidth - margin - 80
//         doc.rect(rightBoxX, infoBoxY, 80, 30)
        
//         doc.setFont(undefined, 'bold')
//         doc.text('Served By:', rightBoxX + 3, infoBoxY + 8)
//         doc.text('Payment Method:', rightBoxX + 3, infoBoxY + 16)
//         doc.text('Status:', rightBoxX + 3, infoBoxY + 24)
        
//         doc.setFont(undefined, 'normal')
//         doc.text(inventory.user?.name ?? 'N/A', rightBoxX + 35, infoBoxY + 8)
//         doc.text(inventory.payment_method ?? 'N/A', rightBoxX + 35, infoBoxY + 16)
//         doc.setFont(undefined, 'bold')
//         doc.text((inventory.status ?? 'PENDING').toUpperCase(), rightBoxX + 35, infoBoxY + 24)

//         // ITEMS TABLE
//         const tableStartY = 120
        
//         // Table border
//         doc.setLineWidth(0.8)
        
//         // Table Header (border only, no fill)
//         doc.rect(margin, tableStartY, pageWidth - 2 * margin, 8)
        
//         doc.setTextColor(0, 0, 0)
//         doc.setFontSize(10)
//         doc.setFont(undefined, 'bold')
//         doc.text('#', margin + 3, tableStartY + 5.5)
//         doc.text('DESCRIPTION', margin + 12, tableStartY + 5.5)
//         doc.text('QTY', pageWidth - margin - 70, tableStartY + 5.5, { align: 'center' })
//         doc.text('UNIT PRICE', pageWidth - margin - 45, tableStartY + 5.5, { align: 'right' })
//         doc.text('TOTAL', pageWidth - margin - 3, tableStartY + 5.5, { align: 'right' })

//         // Vertical lines for table
//         doc.line(margin, tableStartY, margin, tableStartY + 8)
//         doc.line(pageWidth - margin, tableStartY, pageWidth - margin, tableStartY + 8)

//         // Table Rows
//         let currentY = tableStartY + 8
//         doc.setFont(undefined, 'normal')
//         doc.setFontSize(9)
//         doc.setLineWidth(0.3)

//         inventory.items.forEach((item, index) => {
//           const rowHeight = 7
          
//           // Row border
//           doc.line(margin, currentY, margin, currentY + rowHeight)
//           doc.line(pageWidth - margin, currentY, pageWidth - margin, currentY + rowHeight)
//           doc.line(margin, currentY + rowHeight, pageWidth - margin, currentY + rowHeight)
          
//           doc.text(String(index + 1), margin + 3, currentY + 4.5)
          
//           const productName = item.product_name ?? 'N/A'
//           const maxNameLength = 40
//           const displayName = productName.length > maxNameLength 
//             ? productName.substring(0, maxNameLength) + '...' 
//             : productName
//           doc.text(displayName, margin + 12, currentY + 4.5)
          
//           doc.text(String(item.quantity ?? 0), pageWidth - margin - 70, currentY + 4.5, { align: 'center' })
//           doc.text(`$${(item.unit_price ?? 0).toFixed(2)}`, pageWidth - margin - 45, currentY + 4.5, { align: 'right' })
//           doc.text(`$${(item.total ?? 0).toFixed(2)}`, pageWidth - margin - 3, currentY + 4.5, { align: 'right' })
          
//           currentY += rowHeight
//         })

//         // TOTALS SECTION
//         currentY += 10
//         const totalsX = pageWidth - margin - 55

//         doc.setFontSize(10)
//         doc.setFont(undefined, 'normal')
//         doc.setLineWidth(0.3)
        
//         doc.text('Subtotal:', totalsX, currentY, { align: 'right' })
//         doc.text(`$${(inventory.subtotal ?? 0).toFixed(2)}`, pageWidth - margin - 3, currentY, { align: 'right' })
//         currentY += 6

//         if ((inventory.discount ?? 0) > 0) {
//           doc.text('Discount:', totalsX, currentY, { align: 'right' })
//           doc.text(`-$${(inventory.discount ?? 0).toFixed(2)}`, pageWidth - margin - 3, currentY, { align: 'right' })
//           currentY += 6
//         }

//         if ((inventory.tax ?? 0) > 0) {
//           doc.text('Tax:', totalsX, currentY, { align: 'right' })
//           doc.text(`$${(inventory.tax ?? 0).toFixed(2)}`, pageWidth - margin - 3, currentY, { align: 'right' })
//           currentY += 6
//         }

//         // Double line above total
//         doc.setLineWidth(0.8)
//         doc.line(totalsX - 5, currentY - 2, pageWidth - margin, currentY - 2)
//         doc.setLineWidth(0.3)
//         doc.line(totalsX - 5, currentY - 3.5, pageWidth - margin, currentY - 3.5)
        
//         // Total (border box instead of fill)
//         currentY += 2
//         doc.setLineWidth(1.2)
//         doc.rect(totalsX - 5, currentY - 4, 60, 9)
        
//         doc.setFontSize(12)
//         doc.setFont(undefined, 'bold')
//         doc.text('TOTAL:', totalsX, currentY + 2, { align: 'right' })
//         doc.text(`$${(inventory.total ?? 0).toFixed(2)}`, pageWidth - margin - 3, currentY + 2, { align: 'right' })

//         // FOOTER SECTION
//         const footerY = pageHeight - 45

//         // Top line separator
//         doc.setLineWidth(0.5)
//         doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5)

//         // Signature and Stamp
//         doc.setFontSize(9)
//         doc.setFont(undefined, 'normal')
//         doc.setLineWidth(0.5)
        
//         if (signImg) {
//           doc.addImage(signImg, 'PNG', margin, footerY, 25, 15)
//         }
//         doc.line(margin, footerY + 18, margin + 40, footerY + 18)
//         doc.text('Authorized Signature', margin + 5, footerY + 22)

//         if (stampImg) {
//           doc.addImage(stampImg, 'PNG', pageWidth - margin - 30, footerY, 25, 15)
//         }
//         doc.line(pageWidth - margin - 40, footerY + 18, pageWidth - margin, footerY + 18)
//         doc.text('Company Stamp', pageWidth - margin - 25, footerY + 22)

//         // Thank you message
//         doc.setFontSize(10)
//         doc.setFont(undefined, 'italic')
//         doc.text('Thank you for your business!', pageWidth / 2, footerY + 30, { align: 'center' })

//         // Bottom border line
//         doc.setLineWidth(1)
//         doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15)
        
//         doc.setFontSize(8)
//         doc.setFont(undefined, 'normal')
//         doc.text('www.pharmacy.com | Terms & Conditions Apply', pageWidth / 2, pageHeight - 8, { align: 'center' })

//         this.invoicePDFDataURL = doc.output('dataurlstring')
//         this.showPreview = true
//       } catch (err) {
//         console.error('❌ Failed generating invoice PDF', err)
//       } finally {
//         this.isGenerating = false
//       }
//     },

//     clearInvoice() {
//       this.invoicePDFDataURL = null
//       this.showPreview = false
//     },

//     async getImageAsBase64(url: string) {
//       return new Promise<string>((resolve) => {
//         const img = new Image()
//         img.crossOrigin = 'Anonymous'
//         img.onload = () => {
//           const canvas = document.createElement('canvas')
//           canvas.width = img.width
//           canvas.height = img.height
//           const ctx = canvas.getContext('2d')
//           ctx?.drawImage(img, 0, 0)
//           resolve(canvas.toDataURL('image/png'))
//         }
//         img.onerror = () => {
//           resolve('')
//         }
//         img.src = url
//       })
//     },
//   },
// })








// WITH IMAGES DESIGN
// import { defineStore } from 'pinia'
// import { jsPDF } from 'jspdf'
// import logo from '@/assets/images/logo.jpg'
// import companyStamp from '@/assets/images/logo.jpg'
// import signature from '@/assets/images/logo.jpg'

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
//   type: string
//   user?: { name: string }
//   payment_method: string
//   status: string
//   subtotal: number
//   discount: number
//   tax: number
//   total: number
//   items: InventoryItem[]
//   created_at?: string
// }

// interface InvoiceState {
//   invoicePDFDataURL: string | null
//   isGenerating: boolean
//   showPreview: boolean
// }

// export const useInvoice = defineStore('invoice', {
//   state: (): InvoiceState => ({
//     invoicePDFDataURL: null,
//     isGenerating: false,
//     showPreview: false,
//   }),

//   actions: {
//     async generateInvoice(inventory: Inventory) {
//       this.isGenerating = true
//       try {
//         // Use A4 format for professional invoice
//         const doc = new jsPDF({
//           orientation: 'portrait',
//           unit: 'mm',
//           format: 'a4',
//         })

//         const pageWidth = doc.internal.pageSize.getWidth()
//         const margin = 20
//         let y = margin

//         // Load images
//         const logoImg = await this.getImageAsBase64(logo)
//         const stampImg = await this.getImageAsBase64(companyStamp)
//         const signImg = await this.getImageAsBase64(signature)

//         // ===== HEADER SECTION =====
//         try {
//           // Logo on the left
//           doc.addImage(logoImg, 'PNG', margin, y, 40, 40)
//         } catch (e) {
//           console.warn('Logo not loaded, using text header')
//         }

//         // Company info on the right
//         doc.setFontSize(20)
//         doc.setFont(undefined, 'bold')
//         doc.setTextColor(44, 62, 80) // Dark blue color
//         doc.text('PHARMACY STORE', pageWidth - margin, y, { align: 'right' })
        
//         doc.setFontSize(10)
//         doc.setFont(undefined, 'normal')
//         doc.setTextColor(100, 100, 100)
//         doc.text('123 Medical Street, Health City', pageWidth - margin, y + 8, { align: 'right' })
//         doc.text('Phone: (123) 456-7890 | Email: info@pharmacystore.com', pageWidth - margin, y + 16, { align: 'right' })
//         doc.text('Website: www.pharmacystore.com', pageWidth - margin, y + 24, { align: 'right' })

//         y += 50

//         // ===== INVOICE TITLE =====
//         doc.setFontSize(24)
//         doc.setFont(undefined, 'bold')
//         doc.setTextColor(44, 62, 80)
//         doc.text('INVOICE', pageWidth / 2, y, { align: 'center' })
        
//         y += 15

//         // ===== INVOICE DETAILS SECTION =====
//         const detailsX = pageWidth - margin
//         doc.setFontSize(12)
//         doc.setFont(undefined, 'bold')
//         doc.setTextColor(44, 62, 80)
        
//         // Invoice Number
//         doc.text('Invoice #:', detailsX - 60, y, { align: 'right' })
//         doc.setFont(undefined, 'normal')
//         doc.text(inventory.invoice_number || 'N/A', detailsX, y, { align: 'right' })
//         y += 8

//         // Date
//         doc.setFont(undefined, 'bold')
//         doc.text('Date:', detailsX - 60, y, { align: 'right' })
//         doc.setFont(undefined, 'normal')
//         const invoiceDate = inventory.created_at ? new Date(inventory.created_at).toLocaleDateString() : new Date().toLocaleDateString()
//         doc.text(invoiceDate, detailsX, y, { align: 'right' })
//         y += 8

//         // Staff
//         doc.setFont(undefined, 'bold')
//         doc.text('Staff:', detailsX - 60, y, { align: 'right' })
//         doc.setFont(undefined, 'normal')
//         doc.text(inventory.user?.name || 'N/A', detailsX, y, { align: 'right' })
//         y += 8

//         // Payment Method
//         doc.setFont(undefined, 'bold')
//         doc.text('Payment:', detailsX - 60, y, { align: 'right' })
//         doc.setFont(undefined, 'normal')
//         doc.text((inventory.payment_method || '').toUpperCase(), detailsX, y, { align: 'right' })
//         y += 15

//         // ===== ITEMS TABLE =====
//         // Table Header
//         doc.setFillColor(44, 62, 80) // Dark blue background
//         doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F')
        
//         doc.setTextColor(255, 255, 255) // White text
//         doc.setFont(undefined, 'bold')
//         doc.text('Description', margin + 5, y + 7)
//         doc.text('Qty', pageWidth - margin - 80, y + 7)
//         doc.text('Unit Price', pageWidth - margin - 50, y + 7, { align: 'right' })
//         doc.text('Total', pageWidth - margin - 5, y + 7, { align: 'right' })

//         y += 10

//         // Table Rows
//         doc.setTextColor(0, 0, 0)
//         doc.setFont(undefined, 'normal')
        
//         inventory.items.forEach((item, index) => {
//           // Alternate row colors
//           if (index % 2 === 0) {
//             doc.setFillColor(245, 245, 245)
//             doc.rect(margin, y, pageWidth - 2 * margin, 10, 'F')
//           }

//           doc.text(item.product_name || 'Product', margin + 5, y + 7)
//           doc.text(String(item.quantity || 0), pageWidth - margin - 80, y + 7)
//           doc.text(`₦${(item.unit_price || 0).toFixed(2)}`, pageWidth - margin - 50, y + 7, { align: 'right' })
//           doc.text(`₦${(item.total || 0).toFixed(2)}`, pageWidth - margin - 5, y + 7, { align: 'right' })
          
//           y += 10
//         })

//         y += 15

//         // ===== TOTALS SECTION =====
//         const totalsX = pageWidth - margin
        
//         // Subtotal
//         doc.text('Subtotal:', totalsX - 60, y, { align: 'right' })
//         doc.text(`₦${(inventory.subtotal || 0).toFixed(2)}`, totalsX, y, { align: 'right' })
//         y += 8

//         // Discount
//         if ((inventory.discount || 0) > 0) {
//           doc.text('Discount:', totalsX - 60, y, { align: 'right' })
//           doc.setTextColor(220, 53, 69) // Red color for discount
//           doc.text(`-₦${(inventory.discount || 0).toFixed(2)}`, totalsX, y, { align: 'right' })
//           doc.setTextColor(0, 0, 0)
//           y += 8
//         }

//         // Tax
//         if ((inventory.tax || 0) > 0) {
//           doc.text('Tax:', totalsX - 60, y, { align: 'right' })
//           doc.text(`₦${(inventory.tax || 0).toFixed(2)}`, totalsX, y, { align: 'right' })
//           y += 8
//         }

//         // Grand Total
//         doc.setFont(undefined, 'bold')
//         doc.setFontSize(14)
//         doc.setTextColor(44, 62, 80)
//         doc.text('GRAND TOTAL:', totalsX - 60, y + 5, { align: 'right' })
//         doc.text(`₦${(inventory.total || 0).toFixed(2)}`, totalsX, y + 5, { align: 'right' })
        
//         y += 20

//         // ===== FOOTER SECTION =====
//         doc.setFontSize(10)
//         doc.setFont(undefined, 'normal')
//         doc.setTextColor(100, 100, 100)
        
//         // Thank you message
//         doc.text('Thank you for your business!', pageWidth / 2, y, { align: 'center' })
//         y += 6
//         doc.text('We appreciate your patronage and look forward to serving you again.', pageWidth / 2, y, { align: 'center' })
        
//         y += 15

//         // Terms and conditions
//         doc.text('Terms & Conditions:', margin, y)
//         doc.text('• Payment due upon receipt', margin, y + 6)
//         doc.text('• Goods sold are not returnable', margin, y + 12)
//         doc.text('• For queries contact: (123) 456-7890', margin, y + 18)

//         // Signature and stamp area
//         try {
//           doc.addImage(signImg, 'PNG', pageWidth - margin - 60, y, 50, 30)
//           doc.text('Authorized Signature', pageWidth - margin - 35, y + 35, { align: 'center' })
//         } catch (e) {
//           console.warn('Signature not added')
//         }

//         // ===== BORDER =====
//         doc.setDrawColor(200, 200, 200)
//         doc.rect(margin - 5, margin - 5, pageWidth - 2 * margin + 10, y + 50, 'S')

//         // ✅ Output PDF
//         this.invoicePDFDataURL = doc.output('dataurlstring')
//         this.showPreview = true
        
//         console.log('✅ Professional invoice generated successfully')
//       } catch (err) {
//         console.error('❌ Failed generating invoice PDF', err)
//       } finally {
//         this.isGenerating = false
//       }
//     },

//     clearInvoice() {
//       this.invoicePDFDataURL = null
//       this.showPreview = false
//     },

//     async getImageAsBase64(url: string) {
//       return new Promise<string>((resolve, reject) => {
//         const img = new Image()
//         img.crossOrigin = 'Anonymous'
//         img.onload = () => {
//           try {
//             const canvas = document.createElement('canvas')
//             canvas.width = img.width
//             canvas.height = img.height
//             const ctx = canvas.getContext('2d')
//             ctx?.drawImage(img, 0, 0)
//             resolve(canvas.toDataURL('image/png'))
//           } catch (error) {
//             console.error('Canvas error:', error)
//             // Return a transparent pixel as fallback
//             resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')
//           }
//         }
//         img.onerror = () => {
//           console.warn('Failed to load image:', url)
//           // Return transparent pixel on error
//           resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')
//         }
//         img.src = url
//       })
//     },
//   },
// })







// OTHER
import { defineStore } from 'pinia'
import { jsPDF } from 'jspdf'
import logo from '@/assets/images/logo.jpg'
import robotoFont from '@/assets/fonts/Roboto.ttf'
import robotoBoldFont from '@/assets/fonts/Roboto-Bold.ttf' // ⭐ Imported Bold Font
import { Inventory, InvoiceState } from '@/types' 

export const useInvoice = defineStore('invoice', {
  state: (): InvoiceState => ({
    invoicePDFDataURL: null,
    isGenerating: false,
    showPreview: false,
  }),

  actions: {
    async generateInvoice(
      inventory: Inventory,
      servedBy?: string,
      customerName?: string
    ) {
      this.isGenerating = true

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

      // Invoice Info Alignment (Adjusted in previous steps)
      const detailValueOffset = 25 
      const detailTitleX = margin + 1 

      const items = inventory.items || inventory.inventory_items || []
      let font: string = ''
      let boldFont: string = '' // ⭐ Holds the content of the bold font file
      let logoImg: string = ''
      
      let totalValueStart: number = 0 
      const nairaSpacing = 0.5 

      // --- HELPER FUNCTIONS (UNCHANGED) ---
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
      }

      const capitalizeFirstLetter = (str?: string): string =>
        str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : 'N/A'

      const getProductName = (item: any): string =>
        item.product_name || item.name || item.product?.name || 'Unknown Product'

      const getUnitPrice = (item: any): number =>
        item.unit_price || item.price || 0

      const getItemTotal = (item: any): number =>
        item.total && item.total > 0
          ? item.total
          : (item.quantity || 0) * getUnitPrice(item)

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
      // --- END HELPER FUNCTIONS ---

      try {
        // --- 1. Load Assets & Register Font Data ---
        
        // Load REGULAR font data
        const robotoFontResponse = await fetch(robotoFont)
        const robotoFontBuffer = await robotoFontResponse.arrayBuffer()
        font = new Uint8Array(robotoFontBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ''
        )

        // ⭐ NEW: Load BOLD font data
        const robotoBoldFontResponse = await fetch(robotoBoldFont)
        const robotoBoldFontBuffer = await robotoBoldFontResponse.arrayBuffer()
        boldFont = new Uint8Array(robotoBoldFontBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
        )

        logoImg = await this.getImageAsBase64(logo)

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
        // ⭐ NEW: Register Bold Font on tempDoc
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

        // --- 3. Create Final PDF Document ---
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [pageWidth, totalHeight],
        })

        // Register Fonts on final document
        doc.addFileToVFS('Roboto.ttf', font)
        doc.addFileToVFS('Roboto-Bold.ttf', boldFont) // ⭐ Add bold font file to VFS
        
        doc.addFont('Roboto.ttf', 'Roboto', 'normal')
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold') // ⭐ Register the bold font data for 'bold' style
        doc.addFont('Roboto.ttf', 'Roboto', 'italic')
        doc.setFont('Roboto', 'normal')

        // --- 4. Start Drawing Content ---
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

        // --- INVOICE INFO SECTION (Indented titles, wider gap for values) ---
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
        // ---------------------------------

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
        doc.text('www.pharmacy.com', pageWidth / 2, y, { align: 'center' })

        // Output
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
  },
})