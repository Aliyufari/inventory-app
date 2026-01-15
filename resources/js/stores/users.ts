import { defineStore } from 'pinia'
import { router, usePage } from '@inertiajs/vue3'
import type { User } from '@/types'
import { toast } from 'vue-sonner'

type PaginationMeta = {
  current_page: number
  last_page: number
  links: any[]
}

export const useUser = defineStore('users', {
  state: () => ({
    users: [] as User[],
    rawResponse: null as unknown,
    pagination: null as PaginationMeta | null,

    search: '',
    role: 'all',
    store: 'all',
    status: 'all',

    modalType: null as 'add' | 'edit' | 'view' | 'delete' | null,
    selectedUser: null as User | null,

    loading: false,
    error: null as string | null,

    allRoles: [] as { label: string; value: string }[],
    allStores: [] as { label: string; value: string }[],

    debounceTimer: null as ReturnType<typeof setTimeout> | null,
  }),

  getters: {
    currentPage: (s) => s.pagination?.current_page ?? 1,
    totalPages: (s) => s.pagination?.last_page ?? 1,
    paginationLinks: (s) => s.pagination?.links ?? [],

    roleOptions: (s) => [
      { label: 'All Roles', value: 'all' },
      ...s.allRoles,
    ],
  },

  actions: {
    // populate users + roles
    setUsers(payload: any, roles: any[] = [], stores: any[] = []) {
      this.rawResponse = payload
      this.users = payload?.data ?? payload ?? []
      this.pagination = payload?.meta ?? null

      this.allRoles = roles.map((r) => ({
        label: r.name.replace(/\b\w/g, l => l.toUpperCase()),
        value: r.id,
      }))

      this.allStores = stores.map((s) => ({
        label: s.name.replace(/\b\w/g, l => l.toUpperCase()),
        value: s.id,
      }))
    },

    updateFilter(key: 'search' | 'role' | 'status', value: string) {
      this[key] = value
      this.applyFilters()
    },

    applyFilters() {
      if (this.debounceTimer) clearTimeout(this.debounceTimer)

      this.debounceTimer = setTimeout(() => {
        const params: Record<string, any> = { page: 1 }

        if (this.search) params.search = this.search
        if (this.role !== 'all') params.role = this.role
        if (this.status !== 'all') params.status = this.status

        router.get(route('users.index'), params, {
          preserveState: true,
          preserveScroll: true,
          only: ['data'],
        })
      }, 400)
    },

    changePage(page: number) {
      const params: Record<string, any> = { page }

      if (this.search) params.search = this.search
      if (this.role !== 'all') params.role = this.role
      if (this.status !== 'all') params.status = this.status

      router.get(route('users.index'), params, {
        preserveState: true,
        preserveScroll: true,
        only: ['data'],
      })
    },

    openAdd() {
      this.modalType = 'add'
      this.selectedUser = null
    },

    openView(user: User) {
      this.modalType = 'view'
      this.selectedUser = user
    },

    openEdit(user: User) {
      this.modalType = 'edit'
      this.selectedUser = user
    },

    openDelete(user: User) {
      this.modalType = 'delete'
      this.selectedUser = user
    },

    closeModal() {
      this.modalType = null
      this.selectedUser = null
    },

    async createUser(form: any) {
      this.loading = true

      return new Promise((resolve, reject) => {
        form.post(route('users.store'), {
          forceFormData: true,
          onSuccess: () => {
            const page = usePage()
            toast.success(page.props.flash?.message ?? 'User created')
            this.closeModal()
            router.reload({
              only: ['data'],
              onFinish: () => {
                this.loading = false
                resolve(true)
              }
            })
          },
          onError: (errors: any) => {
            this.loading = false
            reject(errors)
          },
          onCancel: () => {
            this.loading = false
            reject(new Error('Request cancelled'))
          }
        })
      })
    },

    async updateUser(id: string, form: any) {
      this.loading = true

      return new Promise((resolve, reject) => {
        form.post(route('users.update', id), {
          forceFormData: true,
          preserveScroll: true,
          onSuccess: () => {
            const page = usePage()
            toast.success(page.props.flash?.message ?? 'User updated')
            this.loading = false
            this.closeModal()
            router.reload({
              only: ['data'],
              onFinish: () => resolve(true),
            })
          },
          onError: (errors: any) => {
            this.loading = false
            reject(errors)
          },
          onCancel: () => {
            this.loading = false
            reject(new Error('Request cancelled'))
          }
        })
      })
    },

    async deleteUser(id: string) {
      this.loading = true
      this.error = null

      return new Promise((resolve, reject) => {
        router.delete(route('users.delete', id), {
          onSuccess: () => {
            toast.success('User deleted successfully')
            this.closeModal()
            router.reload({
              only: ['data'],
              onFinish: () => {
                this.loading = false
                resolve(true)
              }
            })
          },
          onError: (errors: any) => {
            this.error = 'Failed to delete user'
            this.loading = false
            toast.error(this.error)
            reject(errors)
          },
          onCancel: () => {
            this.loading = false
            reject(new Error('Request cancelled'))
          }
        })
      })
    },
  },
})
