<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from '@/stores/users'

// Components
import Modal from '@/components/AppModal.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge' // Assuming you have a Badge component

const props = defineProps<{
  user: any 
}>()

const usersStore = useUser()

const showViewModal = computed({
  get: () => usersStore.modalType === 'view',
  set: (val) => {
    if (!val) usersStore.closeModal()
  },
})

// Function to capitalize first letter for display
const capitalize = (str: string | undefined) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '—'
</script>

<template>
  <Modal v-model="showViewModal" title="View User" width="500px">
    <div class="space-y-6 py-2">
      <div class="flex items-center gap-4 border-b pb-4">
        <div class="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border text-xl font-bold text-gray-500">
          {{ user?.name?.charAt(0) || 'U' }}
        </div>
        <div>
          <h3 class="text-lg font-semibold">{{ user?.name || 'N/A' }}</h3>
          <p class="text-sm text-gray-500">{{ capitalize(user?.role?.name) }}</p>
        </div>
      </div>

      <div class="grid gap-5">
        <div class="grid gap-2">
          <Label class="text-gray-500">Email Address</Label>
          <Input :model-value="user?.email" readonly class="bg-gray-50 cursor-default" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label class="text-gray-500">Gender</Label>
            <Input :model-value="capitalize(user?.gender)" readonly class="bg-gray-50 cursor-default" />
          </div>

          <div class="grid gap-2">
            <Label class="text-gray-500">Status</Label>
            <div>
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1"
                :class="user?.status?.toLowerCase() === 'active' || user?.status === true
                  ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                  : 'bg-red-100 text-red-700 ring-red-200'"
              >
                {{ user?.status?.toLowerCase() === 'active' || user?.status === true ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>

        <div class="grid gap-2">
          <Label class="text-gray-500">Assigned Stores</Label>
          <div class="flex flex-wrap gap-2 p-3 border rounded-md bg-gray-50 min-h-[40px]">
            <template v-if="user?.stores?.length">
              <span 
                v-for="store in user.stores" 
                :key="store.id"
                class="bg-white border text-gray-700 px-2 py-1 rounded text-xs shadow-sm"
              >
                {{ store.name }}
              </span>
            </template>
            <span v-else class="text-sm text-gray-400 italic">No stores assigned</span>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <Button variant="outline" @click="usersStore.closeModal()">
          Close
        </Button>
      </div>
    </template>
  </Modal>
</template>