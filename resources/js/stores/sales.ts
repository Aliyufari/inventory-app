import { Customer, Product } from '@/types'
import { defineStore } from 'pinia'
import { toast } from 'vue-sonner'

export interface CartItem {
  id: number | string
  product_id: number | string
  name: string
  barcode: string
  price: number
  qty: number
  discount?: number
}

export const usePosStore = defineStore('pos', {
  state: () => ({
    items: [] as CartItem[],
    discount: 0, 
    taxRate: 0, 
    customers: [] as Customer[],
    customer: null as Customer | null,
    productOptions: [] as Product[],
    currentStoreId: '',
    _priceMode: 'retail' as 'retail' | 'wholesale',
    note: '',
    paymentMethod: 'cash' as 'cash' | 'pos' | 'transfer',
    loading: false,
  }),

  getters: {
    priceMode: (state) => state._priceMode,
    subtotal: (state) => state.items.reduce((sum, item) => sum + (item.price * item.qty), 0),
    itemDiscountTotal: (state) => state.items.reduce((sum, item) => sum + (item.discount || 0), 0),
    totalDiscount(): number { return this.itemDiscountTotal + this.discount },
    taxableAmount(): number { return Math.max(this.subtotal - this.totalDiscount, 0) },
    tax(): number { return this.taxableAmount * this.taxRate },
    total(): number { return this.taxableAmount + this.tax }
  },

  actions: {
    async fetchCustomers() {
      // Logic to fetch customers from API if needed
    },

    async getProducts(storeId: string) {
      if (!storeId) return
      this.currentStoreId = storeId
      // API call logic here...
    },

    handleProductSearch(query: string) {
      const q = query.toLowerCase().trim()
      return this.productOptions.filter(p => 
        p.name.toLowerCase().includes(q) || p.barcode?.toLowerCase().includes(q)
      )
    },

    findProductByBarcode(barcode: string) {
      return this.productOptions.find(p => String(p.barcode) === String(barcode))
    },

    handleBarcodeScanned(barcode: string): boolean {
      const product = this.findProductByBarcode(barcode)
      if (product) {
        this.addOrIncrementProduct(product)
        return true
      }
      return false
    },

    addOrIncrementProduct(product: Product) {
      const existing = this.items.find(item => String(item.product_id) === String(product.id))
      if (existing) {
        existing.qty += 1
      } else {
        const price = this._priceMode === 'retail' ? product.retail_price : product.wholesale_price
        this.items.push({
          id: product.id, product_id: product.id, name: product.name,
          barcode: product.barcode || '', price, qty: 1, discount: 0,
        })
      }
    },

    setPriceMode(mode: 'retail' | 'wholesale') {
      this._priceMode = mode
      this.items.forEach(item => {
        const product = this.productOptions.find(p => String(p.id) === String(item.product_id))
        if (product) item.price = mode === 'retail' ? product.retail_price : product.wholesale_price
      })
    },

    updateQty(id: any, qty: number) {
      const item = this.items.find(i => i.id === id)
      if (item) item.qty = qty
    },

    updateItemDiscount(id: any, discount: number) {
      const item = this.items.find(i => i.id === id)
      if (item) item.discount = discount
    },

    clear() {
      this.items = []
      this.discount = 0
      this.customer = null
      this.note = ''
      this.paymentMethod = 'cash'
    },

    increase(id: any) { this.updateQty(id, (this.items.find(i => i.id === id)?.qty || 0) + 1) },
    decrease(id: any) { 
      const item = this.items.find(i => i.id === id)
      if (item && item.qty > 1) this.updateQty(id, item.qty - 1)
    },
    remove(id: any) { this.items = this.items.filter(i => i.id !== id) },
    setCustomer(c: any) { this.customer = c },
    setDiscount(val: number) { this.discount = val },
    setTaxRate(val: number) { this.taxRate = val },
    setNote(val: string) { this.note = val }
  }
})