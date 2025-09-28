import { defineStore } from 'pinia'
import axios from 'axios'
import type { User } from '@/types'

export const useUser = defineStore('users', {
  state: () => ({
    users: [] as User[],                  // actual list
    pagination: null as Record<string, any> | null, // meta + links
    modalType: null as string | null,     // 'view' | 'edit' | 'delete' | 'add'
    selectedUser: null as User | null,
    search: '' as string,                 // 🔍 new search state
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchUsers(page: number = 1) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.get(route('users.index'), {
          params: { page, search: this.search }, // ✅ search included
        })

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
      this.users.unshift(user)
    },

    // ✅ update existing user in store
    updateUser(updated: User) {
      const index = this.users.findIndex((u) => u.id === updated.id)
      if (index !== -1) {
        this.users[index] = updated
      }
    },

    async deleteUser(id: string) {
      this.loading = true
      this.error = null

      try {
        const { data } = await axios.delete(route('users.delete', id))

        if (data.status) {
          this.users = this.users.filter((s) => s.id !== id)

          this.closeModal()
          await this.fetchUsers()

          // (Optional) Show toast/snackbar
          // toast.success(data.message)
        } else {
          this.error = data.message || 'Failed to delete user'
        }
      } catch (error: any) {
        console.error('Error deleting user:', error)
        this.error = error.message || 'Failed to delete user'
      } finally {
        this.loading = false
      }
    },

    // ✅ reset search and reload
    resetSearch() {
      this.search = ''
      this.fetchUsers(1)
    },

    openModal(type: string, user: User | null = null) {
      this.closeModal()
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
