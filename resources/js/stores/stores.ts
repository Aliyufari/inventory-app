import { defineStore } from 'pinia'
import axios from 'axios'
import type { Store } from '@/types'

export const useStore = defineStore('stores', {
  state: () => ({
    stores: [] as Store[],
    pagination: null as Record<string, any> | null,
    modalType: null as string | null,   
    selectedStore: null as Store | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchStores(page: number = 1) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.get(route('stores.index', { page }))
        this.stores = data.stores.data || []
        this.pagination = {
          links: data.stores.links,
          meta: data.stores.meta,
        }
      } catch (error: any) {
        console.error('Error fetching stores:', error)
        this.error = error.message || 'Failed to fetch stores'
      } finally {
        this.loading = false
      }
    },

    async deleteStore(id: number) {
      this.loading = true
      this.error = null

      try {
        await axios.delete(route('stores.destroy', id))
        this.stores = this.stores.filter((s) => s.id !== id) // remove locally
        this.closeModal()
      } catch (error: any) {
        console.error('Error deleting store:', error)
        this.error = error.message || 'Failed to delete store'
      } finally {
        this.loading = false
      }
    },

    openModal(type: string, store: Store | null = null) {
      this.closeModal()
      this.modalType = type
      this.selectedStore = store
    },

    closeModal() {
      this.modalType = null
      this.selectedStore = null
    },
  },

  getters: {
    isModalOpen: (state) => state.modalType !== null,
  },
})
