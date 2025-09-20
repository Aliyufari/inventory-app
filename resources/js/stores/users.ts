import { defineStore } from 'pinia'
import axios from 'axios'
import type { User } from '@/types'

export const useUser = defineStore('users', {
  state: () => ({
    users: [] as User[],                // actual list
    pagination: null as Record<string, any> | null, // meta + links
    modalType: null as string | null,   // 'view' | 'edit' | 'delete' | 'add'
    selectedUser: null as User | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchUsers(page: number = 1) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.get(route('users.index', { page }))
        this.users = data.users.data || []
        this.pagination = {
          links: data.users.links,
          meta: data.users.meta,
        }
      } catch (error: any) {
        console.error('Error fetching users:', error)
        this.error = error.message || 'Failed to fetch users'
      } finally {
        this.loading = false
      }
    },

    // ✅ add freshly created user to store
    addUser(user: User) {
      this.users.unshift(user) // put at top of table
    },

    // ✅ update existing user in store
    updateUser(updated: User) {
      const index = this.users.findIndex((u) => u.id === updated.id)
      if (index !== -1) {
        this.users[index] = updated
      }
    },

    // ✅ remove deleted user from store
    removeUser(userId: number) {
      this.users = this.users.filter((u) => u.id !== userId)
    },

    openModal(type: string, user: User | null = null) {
      this.closeModal() // reset before opening
      this.modalType = type
      this.selectedUser = user
    },

    closeModal() {
      this.modalType = null
      this.selectedUser = null
    },
  },

  getters: {
    activeUsers: (state) => state.users.filter((u) => u.status === 'Active'),
    isModalOpen: (state) => state.modalType !== null,
  },
})
