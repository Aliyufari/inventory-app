import { defineStore } from 'pinia'
import axios from 'axios'
import type { Store } from '@/types'

export const useStore = defineStore('stores', {
  state: () => ({
    stores: [] as Store[],
    pagination: null as Record<string, any> | null,
    modalType: null as string | null,
    selectedStore: null as Store | null,
    search: '' as string,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchStores(page: number = 1) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.get(route('stores.index'), {
          params: { page, search: this.search }, 
        })

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

    async deleteStore(id: string) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.delete(route('stores.delete', id))

        if (data.status) {
          this.stores = this.stores.filter((s) => s.id !== id)

          this.closeModal()
          await this.fetchStores()

          // (Optional) Show toast/snackbar
          // toast.success(data.message)
        } else {
          this.error = data.message || 'Failed to delete store'
        }
      } catch (error: any) {
        console.error('Error deleting store:', error)
        this.error = error.message || 'Failed to delete store'
      } finally {
        this.loading = false
      }
    },

    resetSearch() {
      this.search = ''
      this.fetchStores(1)
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
