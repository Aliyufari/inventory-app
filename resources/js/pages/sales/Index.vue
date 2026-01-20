<script setup lang="ts">
import { onMounted, ref } from "vue"
import { Head, useForm, usePage } from "@inertiajs/vue3"
import AppLayout from "@/layouts/AppLayout.vue"
import SaleLayout from "@/layouts/sale/Layout.vue"
import type { BreadcrumbItem, Customer, Product, SharedData } from "@/types"
import SearchBar from "./SearchBar.vue"
import CartTable from "./CartTable.vue"
import InvoiceSummary from "./InvoiceSummary.vue"
import InvoicePreview from "@/pages/sales/InvoivePreview.vue"
import { usePosStore } from "@/stores/sales"
import { toast } from "vue-sonner"
import { useInvoice } from "@/stores/invoice"

const props = defineProps<{
  products?: Product[] 
  customers?: Customer[]
}>()

const breadcrumbs: BreadcrumbItem[] = [{ title: "Sales", href: "/sales" }]
const pos = usePosStore()
const page = usePage<SharedData>()
const invoiceStore = useInvoice()

const searchResults = ref<any[]>([])
const showSearchResults = ref(false)
const isMounted = ref(false)
const showPreview = ref(false)
const latestInvoice = ref(null)
const searchBarRef = ref<InstanceType<typeof SearchBar> | null>(null)

const form = useForm({
  customer_id: null, 
  is_credit: false, 
  total: 0, 
  items: [] as any[], 
  payment_method: 'cash', 
  customer_type: 'retail', 
  note: '', 
  tax: 0, 
  discount: 0
})

onMounted(() => {
  if (props.customers?.length) {
    pos.customers = props.customers
  }

  if (props.products?.length) {
    pos.productOptions = props.products.map(p => ({ 
      ...p, 
      retail_price: Number(p.retail_price), 
      wholesale_price: Number(p.wholesale_price) 
    }))
  }

  setTimeout(() => (isMounted.value = true), 50)
})

const handleSearch = (query: string) => {
  if (!query || query.length < 2) {
    showSearchResults.value = false
    searchResults.value = []
    return
  }
  searchResults.value = pos.handleProductSearch(query)
  showSearchResults.value = true
}

const handleBarcodeScanned = (barcode: string) => {
  if (pos.handleBarcodeScanned(barcode)) {
    toast.success("Product added")
  } else {
    toast.error("Product not found", { description: barcode })
  }
  showSearchResults.value = false
  searchResults.value = []
  searchBarRef.value?.clearInput()
}

const selectProduct = (product: any) => {
  pos.addOrIncrementProduct(product)
  showSearchResults.value = false
  searchResults.value = []
  searchBarRef.value?.clearInput()
}

const handlePay = () => {
  if (!pos.items || pos.items.length === 0) {
    return toast.error("Cart is empty. Please add products.")
  }

  const mappedItems = pos.items.map(item => ({
    product_id: item.product_id, 
    quantity: item.qty, 
    unit_price: item.price, 
    total: (item.qty * item.price) - (item.discount || 0), 
    discount: item.discount || 0
  }))

  form.customer_id = pos.customer?.id || null
  form.is_credit = !!pos.customer
  form.total = pos.total
  form.tax = pos.tax
  form.discount = pos.totalDiscount
  form.payment_method = pos.paymentMethod
  form.customer_type = pos.priceMode
  form.note = pos.note
  form.items = mappedItems

  console.log("Submitting items:", form.items)

  form.post(route('sales.store'), {
    preserveScroll: true,
    onSuccess: (page) => {
      const customerName = pos.customer?.name || 'Walk-in'
      const userName = page.props.auth?.user?.name || 'Staff'
      const invoiceData = page.props.invoice

      pos.clear()

      if (invoiceData) {
        invoiceStore.generateInvoice(invoiceData, userName, customerName)
        toast.success("Transaction Completed")
      }
    },
    onError: (errors) => {
      console.error("Server Validation Errors:", errors)
      toast.error("Failed to save: " + (errors.items || "Check your inputs"))
    }
  })
}
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Sales" />
    <SaleLayout>
      
      <section class="flex justify-end mb-6">
        <div class="relative w-full lg:w-56 h-11 rounded-2xl bg-gray-50 shadow flex overflow-hidden p-1">
          <span 
            class="absolute h-9 w-[calc(50%-0.25rem)] rounded-xl bg-primary transition-transform duration-300 shadow-md"
            :style="{ transform: pos.priceMode === 'wholesale' ? 'translateX(100%)' : 'translateX(0)' }" 
          />
          <button @click="pos.setPriceMode('retail')" class="relative z-10 flex-1 text-sm font-semibold transition-colors" :class="pos.priceMode === 'retail' ? 'text-white' : 'text-gray-600'">Retail</button>
          <button @click="pos.setPriceMode('wholesale')" class="relative z-10 flex-1 text-sm font-semibold transition-colors" :class="pos.priceMode === 'wholesale' ? 'text-white' : 'text-gray-600'">Wholesale</button>
        </div>
      </section>

      <div class="relative flex-1">
        <SearchBar 
          ref="searchBarRef"
          :resultsCount="searchResults.length" 
          @productSearch="handleSearch" 
          @barcodeScanned="handleBarcodeScanned" 
        />

        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div 
            v-if="showSearchResults && searchResults.length"
            class="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div class="max-h-[350px] overflow-y-auto custom-scrollbar">
              <div 
                v-for="product in searchResults" 
                :key="product.id"
                @click="selectProduct(product)"
                class="group px-4 py-3 cursor-pointer hover:bg-primary/5 border-b border-gray-50 last:border-b-0 flex items-center justify-between transition-colors"
              >
                <div class="flex flex-col">
                  <span class="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                    {{ product.name }}
                  </span>
                  <span class="text-xs text-gray-400">{{ product.barcode || 'No Barcode' }}</span>
                </div>
                <div class="text-right">
                  <span class="text-sm font-bold text-gray-900">
                    ₦{{ (pos.priceMode === 'retail' ? product.retail_price : product.wholesale_price).toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
            
            <div v-if="searchResults.length > 0" class="px-4 py-2 bg-gray-50 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
              Showing {{ searchResults.length }} matches
            </div>
          </div>
        </transition>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div class="lg:col-span-8">
          <CartTable 
            :items="pos.items" 
            :discount="pos.discount" 
            :taxRate="pos.taxRate" 
            :note="pos.note"
            @increase="pos.increase" 
            @decrease="pos.decrease" 
            @remove="pos.remove"
            @updateQty="pos.updateQty" 
            @updateItemDiscount="pos.updateItemDiscount"
            @update:discount="pos.setDiscount" 
            @update:taxRate="pos.setTaxRate" 
            @update:note="pos.setNote" 
          />
        </div>

        <div class="lg:col-span-4">
          <InvoiceSummary 
            :customers="pos.customers" 
            :customer="pos.customer" 
            :payment-method="pos.paymentMethod"
            :subtotal="pos.subtotal" 
            :discount="pos.totalDiscount" 
            :tax="pos.tax" 
            :total="pos.total" 
            :loading="form.processing"
            @update:customer="pos.setCustomer" 
            @update:paymentMethod="val => pos.paymentMethod = val" 
            @pay="handlePay" 
            @cancel="pos.clear" 
          />
        </div>
      </div>

      <InvoicePreview />
    </SaleLayout>
  </AppLayout>
</template>