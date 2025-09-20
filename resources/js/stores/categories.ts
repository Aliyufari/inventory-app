import { defineStore } from 'pinia'
import axios from 'axios'
import type { Category } from '@/types'

export const useCategory = defineStore('categories', {
  state: () => ({
    categories: [] as Category[],
    pagination: null as Record<string, any> | null,
    modalType: null as string | null,
    selectedCategory: null as Category | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchCategories(page: number = 1) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.get(route('categories.index', { page }))
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

    async deleteCategory(id: number) {
      this.loading = true
      this.error = null

      try {
        await axios.delete(route('categories.destroy', id))
        this.categories = this.categories.filter((c) => c.id !== id) // remove locally
        this.closeModal()
      } catch (error: any) {
        console.error('Error deleting category:', error)
        this.error = error.message || 'Failed to delete category'
      } finally {
        this.loading = false
      }
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
