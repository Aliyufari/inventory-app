import { defineStore } from "pinia"
import axios from "axios"

export const useInventory = defineStore("inventory", {
  state: () => ({
    inventories: [] as any[],
    pagination: null as { links: any; meta: any } | null,
    modalType: null as string | null,
    selected: null as any | null,
    search: "" as string,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchInventories(page: number = 1) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get(route("inventories.index"), {
          params: { page, search: this.search },
        })
        this.inventories = data.inventories.data || []
        this.pagination = {
          links: data.inventories.links,
          meta: data.inventories.meta,
        }
      } catch (err: any) {
        console.error("Error fetching inventories:", err)
        this.error = err.message || "Failed loading inventories"
      } finally {
        this.loading = false
      }
    },

    async deleteInventory(id: string) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.delete(route('inventory.delete', id))
        if (data.status) {
          this.inventories = this.inventories.filter((s) => s.id !== id)
          this.closeModal()
          await this.fetchInventories()
        } else {
          this.error = data.message || 'Failed to delete inventory'
        }
      } catch (error: any) {
        console.error('Error deleting inventory:', error)
        this.error = error.message || 'Failed to delete inventory'
      } finally {
        this.loading = false
      }
    },

    resetSearch() {
      this.search = ""
      this.fetchInventories(1)
    },

    openModal(type: string, payload: any | null = null) {
      console.log('📂 Opening modal:', type, payload)
      this.modalType = type
      this.selected = payload
    },

    closeModal() {
      console.log('🚪 Closing inventory modal')
      this.modalType = null
      this.selected = null
    },

    addLocal(inventory: any) {
      this.inventories.unshift(inventory)
    },

    updateLocal(updated: any) {
      const idx = this.inventories.findIndex((i) => i.id === updated.id)
      if (idx !== -1) this.inventories[idx] = updated
    },

    removeLocal(id: number | string) {
      this.inventories = this.inventories.filter((i) => i.id !== id)
    },
  },

  getters: {
    isModalOpen: (state) => state.modalType !== null,
  },
})