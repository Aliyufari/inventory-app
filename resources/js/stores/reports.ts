import { defineStore } from 'pinia'
import { router } from '@inertiajs/vue3'

export const useReportStore = defineStore('report', {
  /* ============================
  | State
  |============================ */
  state: () => ({
    loading: false,

    filters: {
      from: null as string | null,
      to: null as string | null,
      store_id: null as string | null,
      customer_id: null as string | null,
      user_id: null as string | null,
      payment_method: null as string | null,
      status: null as string | null,

      sort_by: 'created_at',
      sort_dir: 'desc',
      per_page: 10,
    },
  }),

  /* ============================
  | Getters
  |============================ */
  getters: {
    hasFilters(state) {
      return Object.values(state.filters).some(
        v => v !== null && v !== ''
      )
    },
  },

  /* ============================
  | Actions
  |============================ */
  actions: {
    /* ----------------------------
     | Sales Report
     |---------------------------- */
    salesReport(page = 1) {
      this.loading = true

      router.get(
        route('sales.reports'),
        {
          ...this.cleanFilters(),
          page,
        },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
          onFinish: () => {
            this.loading = false
          },
        }
      )
    },

    /* ----------------------------
     | Reset Filters
     |---------------------------- */
    resetFilters() {
      Object.assign(this.filters, {
        from: null,
        to: null,
        store_id: null,
        customer_id: null,
        user_id: null,
        payment_method: null,
        status: null,
        sort_by: 'created_at',
        sort_dir: 'desc',
        per_page: 20,
      })

      this.salesReport()
    },

    /* ----------------------------
     | Sorting
     |---------------------------- */
    sort(by: string) {
      if (this.filters.sort_by === by) {
        this.filters.sort_dir =
          this.filters.sort_dir === 'asc' ? 'desc' : 'asc'
      } else {
        this.filters.sort_by = by
        this.filters.sort_dir = 'asc'
      }

      this.salesReport()
    },

    /* ============================
     | Helpers
     |============================ */
    cleanFilters() {
      return Object.fromEntries(
        Object.entries(this.filters).filter(
          ([, value]) =>
            value !== null &&
            value !== '' &&
            value !== undefined
        )
      )
    },
  },
})
