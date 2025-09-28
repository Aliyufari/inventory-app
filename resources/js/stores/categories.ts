import { defineStore } from 'pinia'
import axios from 'axios'
import type { Category } from '@/types'

export const useCategory = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    pagination: null as Record<string, any> | null,
    modalType: null as string | null,
    selectedCategory: null as Category | null,
    search: '' as string,  // 🔍 added search
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchCategories(page: number = 1) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.get(route('categories.index'), {
          params: { page, search: this.search }, // ✅ search support
        })

        this.categories = data.categories.data || []
        this.pagination = {
          links: data.categories.links,
          meta: data.categories.meta,
        }
      } catch (error: any) {
        console.error('Error fetching categories:', error)
        this.error = error.message || 'Failed to fetch categories'
      } finally {
        this.loading = false
      }
    },

    async deleteCategory(id: string) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.delete(route('categories.delete', id))

        if (data.status) {
          this.categories = this.categories.filter((s) => s.id !== id)

          this.closeModal()
          await this.fetchCategories()

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

    resetSearch() {
      this.search = ''
      this.fetchCategories(1)
    },

    openModal(type: string, category: Category | null = null) {
      this.closeModal()
      this.modalType = type
      this.selectedCategory = category
    },

    closeModal() {
      this.modalType = null
      this.selectedCategory = null
    },
  },

  getters: {
    isModalOpen: (state) => state.modalType !== null,
  },
})
