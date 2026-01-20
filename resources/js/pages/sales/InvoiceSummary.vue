<script setup lang="ts">
import SearchableSelect from '@/components/ui/select/SearchableSelect.vue';
import { LoaderCircle, Wallet, User, CreditCard } from 'lucide-vue-next'
import { ref, watch, computed } from 'vue'

const props = defineProps<{
  customers: any[]
  customer: any | null
  paymentMethod: 'cash' | 'pos' | 'transfer' | null
  subtotal: number
  discount: number
  tax: number
  total: number
  loading?: boolean 
}>()

const emit = defineEmits([
  'cancel',
  'pay',
  'update:customer',
  'update:paymentMethod',
  'update:loading', 
])

// Sync local refs with props for two-way binding feel
const selectedCustomerId = ref(props.customer?.id ?? null)
const selectedPaymentMethod = ref(props.paymentMethod ?? 'cash')

// Update local state if props change externally
watch(() => props.customer, (newVal) => { selectedCustomerId.value = newVal?.id ?? null })
watch(() => props.paymentMethod, (newVal) => { selectedPaymentMethod.value = newVal ?? 'cash' })

// Emit changes to parent
watch(selectedCustomerId, (val) => {
  const found = props.customers.find(c => c.id === val)
  emit('update:customer', found || null)
})

watch(selectedPaymentMethod, (val) => {
  emit('update:paymentMethod', val)
})

function handlePay() {
  if (props.total <= 0) return 
  emit('pay')
}

const customerOptions = computed(() => props.customers.map(c => ({
  label: `${c.name} ${c.balance ? `(₦${c.balance.toLocaleString()})` : ''}`,
  value: c.id,
})))

const paymentOptions = [
  { label: 'Cash Payment', value: 'cash' },
  { label: 'POS Terminal', value: 'pos' },
  { label: 'Bank Transfer', value: 'transfer' },
]
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden sticky top-6">
    <div class="px-5 py-3 border-b bg-gray-50/50 flex justify-between items-center">
      <h3 class="text-sm font-bold text-gray-700">
        Checkout Summary
      </h3>
      <Wallet class="w-4 h-4 text-gray-400" />
    </div>

    <div class="px-6 py-6 space-y-3 text-sm">
      <div class="flex justify-between items-center text-gray-500">
        <span>Subtotal</span>
        <span class="font-semibold text-gray-900">₦{{ subtotal.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>

      <div class="flex justify-between items-center text-gray-500">
        <span>Discount</span>
        <span class="font-semibold text-red-500">-₦{{ discount.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>

      <div class="flex justify-between items-center text-gray-500 pb-4 border-b border-dashed">
        <span>Tax</span>
        <span class="font-semibold text-gray-900">₦{{ tax.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>

      <div class="flex justify-between items-center pt-2">
        <span class="text-base font-bold text-gray-900">Total Payable</span>
        <span class="text-2xl font-black text-primary">₦{{ total.toLocaleString(undefined, {minimumFractionDigits: 2}) }}</span>
      </div>

      <div class="pt-6 space-y-4">
        <div class="space-y-1.5">
          <label class="text-[11px] font-bold text-gray-400 uppercase ml-1">Payment Method</label>
          <SearchableSelect
            v-model="selectedPaymentMethod"
            :options="paymentOptions"
            placeholder="Select Method"
            class="w-full"
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-[11px] font-bold text-gray-400 uppercase ml-1">Customer</label>
          <SearchableSelect
            v-model="selectedCustomerId"
            :options="customerOptions"
            placeholder="Walk-in Customer"
            class="w-full"
          />
        </div>

        <div class="pt-4 space-y-3">
          <button
            @click="handlePay"
            :disabled="props.loading || total <= 0"
            class="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <LoaderCircle v-if="props.loading" class="mr-2 h-5 w-5 animate-spin" />
            <CreditCard v-else class="mr-2 h-5 w-5" />
            Complete Transaction
          </button>

          <button
            @click="emit('cancel')"
            class="w-full border border-red-300 text-red-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel Transaction
          </button>
        </div>
      </div>
    </div>
  </div>
</template>