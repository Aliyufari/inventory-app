import { defineStore } from 'pinia'
import { router, usePage } from '@inertiajs/vue3'
import type { Product } from '@/types'
import { toast } from 'vue-sonner'

type PaginationMeta = {
  current_page: number
  last_page: number
  links: any[]
}

export const useProduct = defineStore('products', {
  state: () => ({
    products: [] as Product[],
    rawResponse: null as unknown,
    pagination: null as PaginationMeta | null,

    search: '',
    category: 'all',
    status: 'all',

    modalType: null as 'add' | 'edit' | 'view' | 'delete' | null,
    selectedProduct: null as Product | null,

    loading: false,
    error: null as string | null,

    allCategories: [] as { label: string; value: string }[],
    allStores: [] as { label: string; value: string }[],

    // ✅ store-scoped debounce
    debounceTimer: null as ReturnType<typeof setTimeout> | null,
  }),

  getters: {
    currentPage: (s) => s.pagination?.current_page ?? 1,
    totalPages: (s) => s.pagination?.last_page ?? 1,
    paginationLinks: (s) => s.pagination?.links ?? [],

    categoryOptions: (s) => [
      { label: 'All Categories', value: 'all' },
      ...s.allCategories,
    ],

    storeOptions: (s) => [
      { label: 'All Stores', value: 'all' },
      ...s.allStores,
    ],
  },

  actions: {
    // Same signature → components remain untouched
    setProducts(payload: any, categories: any[] = [], stores: any[] = []) {
      this.rawResponse = payload
      this.products = payload?.data ?? payload ?? []
      this.pagination = payload?.meta ?? null

      this.allCategories = categories.map((c) => ({
        label: c.name,
        value: c.id,
      }))

      this.allStores = stores.map((s) => ({
        label: s.name,
        value: s.id,
      }))
    },

    updateFilter(
      key: 'search' | 'category' | 'status',
      value: string
    ) {
      this[key] = value
      this.applyFilters()
    },

    applyFilters() {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer)
      }

      this.debounceTimer = setTimeout(() => {
        const params: Record<string, any> = { page: 1 }

        if (this.search) params.search = this.search
        if (this.category !== 'all') params.category = this.category
        if (this.status !== 'all') params.status = this.status

        router.get(route('products.index'), params, {
          preserveState: true,
          preserveScroll: true,
          only: ['data'],
        })
      }, 400)
    },

    changePage(page: number) {
      const params: Record<string, any> = { page }

      if (this.search) params.search = this.search
      if (this.category !== 'all') params.category = this.category
      if (this.status !== 'all') params.status = this.status

      router.get(route('products.index'), params, {
        preserveState: true,
        preserveScroll: true,
        only: ['data'],
      })
    },

    openAdd() {
      this.modalType = 'add'
      this.selectedProduct = null
    },

    openView(product: Product) {
      this.modalType = 'view'
      this.selectedProduct = product
    },

    openEdit(product: Product) {
      this.modalType = 'edit'
      this.selectedProduct = product
    },

    openDelete(product: Product) {
      this.modalType = 'delete'
      this.selectedProduct = product
    },

    closeModal() {
      this.modalType = null
      this.selectedProduct = null
    },

    async createProduct(form: any) {
      this.loading = true
      
      return new Promise((resolve, reject) => {
        form.post(route('products.store'), {
          forceFormData: true,
          onSuccess: () => {
            const page = usePage()
            toast.success(page.props.flash?.message ?? 'Product created')
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

    getProduct(id: string) {
      return this.products.find(
        (p) => String(p.id) === String(id)
      )
    },

    async updateProduct(id: string, form: any) {
      this.loading = true
      
      return new Promise((resolve, reject) => {
        form.post(route('products.update', id), {
          forceFormData: true,
          preserveScroll: true,
          onSuccess: () => {
            const page = usePage()
            toast.success(page.props.flash?.message ?? 'Product updated')
            this.loading = false
            this.closeModal()
            router.reload({ 
              only: ['data'],
              onFinish: () => {
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
    
    async deleteProduct(id: string) {
      this.loading = true
      this.error = null
      
      return new Promise((resolve, reject) => {
        router.delete(route('products.delete', id), {
          onSuccess: () => {
            toast.success('Product deleted successfully')
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
            this.error = 'Failed to delete product'
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
    }
  }
})
