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
      } catch (error: any) {
        console.error('Error fetching products:', error)
        this.error = error.message || 'Failed to fetch products'
      } finally {
        this.loading = false
      }
    },

    async deleteProduct(id: string) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.delete(route('products.delete', id))

        if (data.status) {
          this.products = this.products.filter((s) => s.id !== id)

          this.closeModal()
          await this.fetchProducts()

          // (Optional) Show toast/snackbar
          // toast.success(data.message)
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
  },

  getters: {
    isModalOpen: (state) => state.modalType !== null,
  },
})
