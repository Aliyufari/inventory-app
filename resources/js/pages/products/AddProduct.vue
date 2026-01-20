<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted, onMounted } from 'vue'
import { useForm } from '@inertiajs/vue3'
import { useProduct } from '@/stores/products'
import { Html5Qrcode } from 'html5-qrcode'
import { Scan, X, CloudUpload, LoaderCircle } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import InputError from '@/components/InputError.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import MultiSelect from '@/components/ui/multiselect/MultiSelect.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import Modal from '@/components/AppModal.vue'
import Select from '@/components/ui/select/Select.vue'

const productStore = useProduct()
const emit = defineEmits(['saved'])

const scannerContainerId = 'barcode-scanner'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

const unitOptions = [
  { label: 'pcs', value: 'pcs' },
  { label: 'bottle', value: 'bottle' },
  { label: 'tablet', value: 'tablet' },
  { label: 'sachet', value: 'sachet' },
  { label: 'box', value: 'box' },
  { label: 'kg', value: 'kg' },
  { label: 'litre', value: 'litre' },
  { label: 'pack', value: 'pack' },
]

const imagePreview = ref<string | null>(null)
const showBarcodeScanner = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const barcodeInputRef = ref<{ $el?: HTMLElement } | HTMLElement | null>(null)

let html5QrCode: Html5Qrcode | null = null
let cameraActive = false

const categories = computed(() => productStore.allCategories)
const stores = computed(() => productStore.allStores)

const form = useForm({
  name: '',
  barcode: '',
  category_ids: [] as string[],
  cost: '',
  retail_price: '',
  wholesale_price: '',
  brand: '',
  unit: 'pcs',
  units_per_packet: '',
  packets_per_carton: '',
  quantity: '',
  store_id: '',
  description: '',
  image: null as File | null,
  status: true,
  allow_wholesale: true,
  min_stock_level: '10',
})

const showAddModal = computed({
  get: () => productStore.modalType === 'add',
  set: (val) => {
    if (!val) {
      cleanup()
      productStore.closeModal()
    }
  },
})

const computedTotalUnits = computed(() => {
  const u = Number(form.units_per_packet) || 0
  const p = Number(form.packets_per_carton) || 0
  return u * p || u || p || 0
})

watch(computedTotalUnits, (v) => {
  form.quantity = String(v)
})

watch(
  () => productStore.modalType,
  async (type) => {
    if (type === 'add') {
      await nextTick()
      setTimeout(() => {
        const el =
          (barcodeInputRef.value as any)?.$el?.querySelector('input') ??
          barcodeInputRef.value
        el?.focus()
      }, 100)
    } else {
      stopScanner()
      showBarcodeScanner.value = false
    }
  }
)

const handleImage = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
    input.value = ''
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    toast.error('Image size must be less than 5MB')
    input.value = ''
    return
  }

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }

  form.image = file
  imagePreview.value = URL.createObjectURL(file)
}

const clearImage = () => {
  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imagePreview.value = null
  form.image = null
  if (fileInput.value) fileInput.value.value = ''
}

const startScanner = async () => {
  if (cameraActive) return

  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode(scannerContainerId)
  }

  try {
    cameraActive = true
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: 250 },
      (text) => {
        form.barcode = text
        stopScanner()
        showBarcodeScanner.value = false
        toast.success('Barcode detected')
      },
      (error) => {
        console.debug('Scan error:', error)
      }
    )
  } catch (err) {
    console.error('Scanner error:', err)
    toast.error('Camera access denied or unavailable')
    cameraActive = false
    showBarcodeScanner.value = false
  }
}

const stopScanner = async () => {
  if (html5QrCode && cameraActive) {
    try {
      await html5QrCode.stop()
      html5QrCode.clear()
    } catch (err) {
      console.error('Error stopping scanner:', err)
    } finally {
      cameraActive = false
    }
  }
}

const toggleScanner = async () => {
  if (showBarcodeScanner.value) {
    showBarcodeScanner.value = false
    await stopScanner()
  } else {
    showBarcodeScanner.value = true
    await nextTick()
    await startScanner()
  }
}

const cleanup = () => {
  stopScanner()
  showBarcodeScanner.value = false

  if (imagePreview.value) {
    URL.revokeObjectURL(imagePreview.value)
    imagePreview.value = null
  }

  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

onUnmounted(cleanup)

const submit = async () => {
  if (form.processing) return

  await productStore.createProduct(form)
  emit('saved')
  cleanup()
  form.reset()
}
</script>

<template>
<Modal v-model="showAddModal" title="Add Product" width="500px">
  <form 
    @submit.prevent="submit" 
    class="flex-1 flex flex-col py-5 space-y-5"
    :class="{ 'pointer-events-none opacity-60': form.processing }"
  >

    <div class="space-y-2">
      <Label>Product Image</Label>
      <div 
        class="h-40 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center gap-3 cursor-pointer hover:border-primary transition relative overflow-hidden"
        @click="fileInput?.click()"
        @keydown.enter="fileInput?.click()"
        @keydown.space.prevent="fileInput?.click()"
        role="button"
        tabindex="0"
        aria-label="Upload product image"
      >
        <CloudUpload class="w-8 h-8 text-primary" v-if="!imagePreview"/>
        <img v-if="imagePreview" :src="imagePreview" class="absolute inset-0 w-full h-full object-cover rounded-xl" alt="Product preview"/>
        <Button 
          v-if="imagePreview" 
          size="sm" 
          type="button" 
          class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white" 
          @click.stop="clearImage"
          aria-label="Remove image"
        >
          <X class="w-4 h-4"/>
        </Button>
      </div>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleImage"/>
      <InputError :message="form.errors.image"/>
    </div>

    <div class="space-y-2">
      <Label for="barcode">Barcode</Label>
      <div class="relative">
        <Input id="barcode" ref="barcodeInputRef" v-model="form.barcode" placeholder="Scan or enter barcode" class="pr-10"/>
        <Button 
          type="button" 
          size="sm" 
          variant="ghost" 
          class="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0" 
          @click="toggleScanner"
          :aria-label="showBarcodeScanner ? 'Stop barcode scanner' : 'Start barcode scanner'"
        >
          <Scan class="h-4 w-4"/>
        </Button>
      </div>
      <InputError :message="form.errors.barcode"/>
      <div v-if="showBarcodeScanner" class="relative mt-3">
        <div id="barcode-scanner" class="w-full h-48 rounded-lg bg-black flex items-center justify-center relative"/>
        <Button 
          type="button" 
          size="sm" 
          class="absolute top-2 right-2 z-20 bg-red-500 hover:bg-red-600 text-white" 
          @click="toggleScanner"
          aria-label="Close scanner"
        >
          <X class="w-4 h-4"/>
        </Button>
      </div>
    </div>

    <div class="space-y-2">
      <Label for="name">Product Name</Label>
      <Input id="name" v-model="form.name" placeholder="Enter product name"/>
      <InputError :message="form.errors.name"/>
    </div>

    <div class="space-y-2">
      <Label for="brand">Brand</Label>
      <Input id="brand" v-model="form.brand" placeholder="Enter brand"/>
      <InputError :message="form.errors.brand"/>
    </div>

    <div class="space-y-2">
      <Label>Categories</Label>
      <MultiSelect v-model="form.category_ids" :options="categories" placeholder="Select categories"/>
      <InputError :message="form.errors.category_ids"/>
    </div>

    <div class="space-y-2">
      <Label>Unit Type</Label>
      <Select v-model="form.unit" :options="unitOptions" placeholder="Select unit"/>
      <InputError :message="form.errors.unit"/>
    </div>

    <div class="grid grid-cols-3 gap-3">
      <div class="space-y-2">
        <Label>Units / Packet</Label>
        <Input type="number" v-model="form.units_per_packet" placeholder="e.g 12" min="0" step="1"/>
      </div>
      <div class="space-y-2">
        <Label>Packets / Carton</Label>
        <Input type="number" v-model="form.packets_per_carton" placeholder="e.g 10" min="0" step="1"/>
      </div>
      <div class="space-y-2">
        <Label>Total Units</Label>
        <Input :value="computedTotalUnits" readonly/>
      </div>
    </div>

    <div class="space-y-2">
      <Label>Cost Price</Label>
      <Input type="number" v-model="form.cost" placeholder="0.00" min="0" step="0.01"/>
      <InputError :message="form.errors.cost"/>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label>Wholesale Price</Label>
        <Input type="number" v-model="form.wholesale_price" placeholder="0.00" min="0" step="0.01"/>
        <InputError :message="form.errors.wholesale_price"/>
      </div>
      <div class="space-y-2">
        <Label>Retail Price</Label>
        <Input type="number" v-model="form.retail_price" placeholder="0.00" min="0" step="0.01"/>
        <InputError :message="form.errors.retail_price"/>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div class="space-y-2">
        <Label>Store</Label>
        <Select v-model="form.store_id" :options="stores" placeholder="Select store"/>
        <InputError :message="form.errors.store_id"/>
      </div>
      <div class="space-y-2">
        <Label>Min Stock Level</Label>
        <Input type="number" v-model="form.min_stock_level" min="0" step="1"/>
        <InputError :message="form.errors.min_stock_level"/>
      </div>
    </div>

    <div class="flex gap-4">
      <div class="flex items-center gap-2">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="form.status" class="sr-only peer" />
          <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
          <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-all peer-checked:translate-x-5"></div>
          <span class="ml-3 text-sm font-medium text-gray-700 select-none">Active</span>
        </label>
      </div>

      <div class="flex items-center gap-2">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="form.allow_wholesale" class="sr-only peer" />
          <div class="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-green-600 transition-all"></div>
          <div class="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transform transition-all peer-checked:translate-x-5"></div>
          <span class="ml-3 text-sm font-medium text-gray-700 select-none">Allow Wholesale</span>
        </label>
      </div>
    </div>

    <div class="space-y-2">
      <Label>Description</Label>
      <Textarea v-model="form.description" rows="3" placeholder="Optional details"/>
      <InputError :message="form.errors.description"/>
    </div>
  </form>

  <template #footer>
    <Button @click="submit" :disabled="form.processing" class="min-w-[120px]">
      <LoaderCircle v-if="form.processing" class="mr-2 h-4 w-4 animate-spin" />
      Save
    </Button>
  </template>
</Modal>
</template>

<style scoped>
video, #barcode-scanner { overflow: hidden; }
</style>