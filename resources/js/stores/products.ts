import { defineStore } from 'pinia'
import axios from 'axios'
import type { Product } from '@/types'

export const useProduct = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    pagination: null as Record<string, any> | null,
    modalType: null as string | null,
    selectedProduct: null as Product | null,
    search: '' as string,
    loading: false,
    error: null as string | null,
    
    // NEW: Add product options for dropdowns
    productOptions: [] as Array<{
      value: string | number
      label: string
      categories: string[]
      brand?: string
      retail_price: number
      wholesale_price: number
      store_id?: string
      store_name?: string
    }>,
  }),

  actions: {
    async fetchProducts(page: number = 1) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.get(route('products.index'), {
          params: { page, search: this.search }, 
        })

        this.products = data.products.data || []
        this.pagination = {
          links: data.products.links,
          meta: data.products.meta,
        }
        
        // NEW: Also populate productOptions
        this.productOptions = (data.products.data || []).map((p: any) => ({
          value: p.id,
          label: p.name,
          categories: p.categories?.map((c: any) => c.name) ?? [],
          brand: p.brand,
          retail_price: Number(p.retail_price) || 0,
          wholesale_price: Number(p.wholesale_price) || 0,
          store_id: p.store?.id ?? null,
          store_name: p.store?.name ?? null,
        }))
      } catch (error: any) {
        console.error('Error fetching products:', error)
        this.error = error.message || 'Failed to fetch products'
      } finally {
        this.loading = false
      }
    },

    // NEW: Specific method for fetching product options (lightweight for dropdowns)
    async fetchProductOptions(storeId?: string) {
      try {
        const params: any = { per_page: 1000 } // Get all products for dropdown
        if (storeId) params.store_id = storeId

        const { data } = await axios.get(route('products.index'), { params })
        
        this.productOptions = (data.products.data || []).map((p: any) => ({
          value: p.id,
          label: p.name,
          categories: p.categories?.map((c: any) => c.name) ?? [],
          brand: p.brand,
          retail_price: Number(p.retail_price) || 0,
          wholesale_price: Number(p.wholesale_price) || 0,
          store_id: p.store?.id ?? null,
          store_name: p.store?.name ?? null,
        }))
      } catch (error: any) {
        console.error('Error fetching product options:', error)
        this.error = error.message || 'Failed to fetch product options'
      }
    },

    async deleteProduct(id: string) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.delete(route('products.delete', id))

        if (data.status) {
          this.products = this.products.filter((s) => s.id !== id)
          // NEW: Also remove from productOptions
          this.productOptions = this.productOptions.filter((p) => p.value !== id)
          this.closeModal()
          await this.fetchProducts()
        } else {
          this.error = data.message || 'Failed to delete product'
        }
      } catch (error: any) {
        console.error('Error deleting product:', error)
        this.error = error.message || 'Failed to delete product'
      } finally {
        this.loading = false
      }
    },

    openModal(type: string, product: Product | null = null) {
      this.closeModal()
      this.modalType = type
      this.selectedProduct = product
    },

    closeModal() {
      this.modalType = null
      this.selectedProduct = null
    },

    // NEW: Helper methods for product calculations
    getProductById(id: string | number) {
      return this.products.find(p => p.id === id) || 
             this.productOptions.find(p => p.value === id)
    },

    calculateProductPrice(productId: string | number, customerType: string): number {
      const product = this.getProductById(productId)
      if (!product) return 0
      
      const price = customerType === "wholesale" 
        ? (product as any).wholesale_price || (product as any).price || 0
        : (product as any).retail_price || (product as any).price || 0
        
      return Number(price) || 0
    },
  },

  getters: {
    isModalOpen: (state) => state.modalType !== null,
    
    // NEW: Get available products for dropdown (filtering out already selected ones)
    getAvailableProductOptions: (state) => {
      return (selectedIds: (string | number)[]) => {
        return state.productOptions.filter((opt) => 
          !selectedIds.map(String).includes(String(opt.value))
        )
      }
    },

    // NEW: Get products by store
    productsByStore: (state) => {
      return (storeId: string) => {
        return state.productOptions.filter(product => 
          !storeId || product.store_id === storeId
        )
      }
    },
  },
})