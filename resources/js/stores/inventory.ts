// stores/inventory.ts
import { defineStore } from "pinia"
import axios from "axios"
import type { Ref } from "vue"

export const useInventory = defineStore("inventory", {
  state: () => ({
    inventories: [] as any[],
    pagination: null as any | null,
    modalType: null as string | null,
    selected: null as any | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchInventories(page = 1) {
      this.loading = true
      this.error = null
      try {
        const { data } = await axios.get(route("inventories.index", { page }))
        // adapt to the structure your backend returns
        this.inventories = data.inventories?.data ?? data.inventories ?? []
        this.pagination = data.inventories?.meta ? { links: data.inventories.links, meta: data.inventories.meta } : null
      } catch (err: any) {
        this.error = err.message || "Failed loading inventories"
      } finally {
        this.loading = false
      }
    },
    openModal(type: string, payload: any | null = null) {
      this.modalType = type
      this.selected = payload
    },
    closeModal() {
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
    removeLocal(id: number|string) {
      this.inventories = this.inventories.filter((i) => i.id !== id)
    }
  }
})
