<script setup lang="ts">
import maleAvatar from '@/assets/images/user-male.png'
import femaleAvatar from '@/assets/images/user-female.png'
import { useUser } from '@/stores/users'
import { Eye, Pencil, Trash2, User } from 'lucide-vue-next'
import Input from '@/components/ui/input/Input.vue'
import Select from '@/components/ui/select/Select.vue'
import Pagination from '../components/Pagination.vue'

const usersStore = useUser()

// Status filter options
const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
]

// Function to capitalize first letter
const capitalize = (str: string | undefined) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '—'
</script>

<template>
  <div class="space-y-6">
    <!-- Filters & Search -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="flex gap-3 w-full md:w-auto flex-wrap sm:flex-nowrap">
        <Select
          :model-value="usersStore.role"
          @update:modelValue="usersStore.updateFilter('role', $event)"
          :options="usersStore.roleOptions"
          placeholder="All Roles"
          class="w-full md:w-52 h-10"
        />
        <Select
          :model-value="usersStore.store"
          @update:modelValue="usersStore.updateFilter('status', $event)"
          :options="statusOptions"
          placeholder="All Statuses"
          class="w-full md:w-44 h-10"
        />
      </div>

      <div class="relative w-full sm:w-full md:w-80">
        <Input
          :model-value="usersStore.search"
          @update:modelValue="usersStore.updateFilter('search', $event)"
          placeholder="Search users..."
          class="w-full h-10 pl-4 pr-4 rounded-lg border border-gray-200 text-sm bg-white
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                transition-all placeholder:text-gray-400"
        />
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full table-auto whitespace-nowrap">
          <thead>
            <tr
              class="bg-gray-50 border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider"
            >
              <th class="px-6 py-4 text-left">#</th>
              <th class="px-6 py-4 text-left">Profile</th>
              <th class="px-6 py-4 text-left">Email</th>
              <th class="px-6 py-4 text-left">Gender</th>
              <th class="px-6 py-4 text-left">Status</th>
              <th class="px-6 py-4 text-right"></th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="(user, index) in usersStore.users"
              :key="user.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <!-- Index -->
              <td class="px-6 py-4">{{ index + 1 }}</td>

              <!-- Profile: Avatar + Name + Role -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3 max-w-[24rem]">
                  <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border">
                    <img
                      :src="user.avatar || (user.gender === 'male' ? maleAvatar : femaleAvatar)"
                      :alt="user.name ?? 'User Avatar'"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium truncate">{{ user.name }}</p>
                    <p class="text-xs text-gray-500 truncate">
                      {{ user.role?.name ? capitalize(user.role.name) : '—' }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Email -->
              <td class="px-6 py-4 truncate">{{ user.email }}</td>

              <!-- Gender -->
              <td class="px-6 py-4">{{ capitalize(user.gender) }}</td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1"
                  :class="user.status
                    ? 'bg-emerald-100 text-emerald-700 ring-emerald-200'
                    : 'bg-red-100 text-red-700 ring-red-200'"
                >
                  {{ user.status ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4">
                <div class="flex justify-end gap-1">
                  <button
                    @click="usersStore.openView(user)"
                    class="p-2 rounded-lg hover:bg-orange-100 text-orange-400 hover:text-orange-600 cursor-pointer"
                    title="View"
                  >
                    <Eye class="w-4 h-4" />
                  </button>

                  <button
                    @click="usersStore.openEdit(user)"
                    class="p-2 rounded-lg hover:bg-green-100 text-green-500 hover:text-green-600 cursor-pointer"
                    title="Edit"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>

                  <button
                    @click="usersStore.openDelete(user)"
                    class="p-2 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-600 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="!usersStore.users.length">
              <td colspan="6" class="py-16 text-center">
                <User class="mx-auto h-12 w-12 text-gray-300" />
                <p class="text-gray-500 font-medium">No users found</p>
                <p class="text-sm text-gray-400">Try adjusting your filters</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <section class="flex justify-center md:justify-end mb-6">
      <Pagination
        v-if="usersStore.totalPages > 1"
        :links="usersStore.paginationLinks"
        :current-page="usersStore.currentPage"
        :total-pages="usersStore.totalPages"
        @change="usersStore.changePage"
      />
    </section>
  </div>
</template>
