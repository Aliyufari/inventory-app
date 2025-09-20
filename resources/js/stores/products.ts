import { defineStore } from 'pinia'
import axios from 'axios'
import type { Product } from '@/types'

export const useProduct = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    pagination: null as Record<string, any> | null,
    modalType: null as string | null,
    selectedProduct: null as Product | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchProducts(page: number = 1) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.get(route('products.index', { page }))
        this.products = data.products.data || []
        this.pagination = {
          links: data.products.links,
          meta: data.products.meta,
        }
      } catch (error: any) {
        console.error('Error fetching products:', error)
        this.error = error.message || 'Failed to fetch products'
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(id: number) {
      this.loading = true
      this.error = null

      try {
        await axios.delete(route('products.destroy', id))
        this.products = this.products.filter((p) => p.id !== id) // remove locally
        this.closeModal()
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
  },

  getters: {
    isModalOpen: (state) => state.modalType !== null,
  },
})
