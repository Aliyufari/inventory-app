<script setup lang="ts">
import maleAvatar from '@/assets/images/user-male.png'
import femaleAvatar from '@/assets/images/user-female.png'
import { useUser } from '@/stores/users'

const usersStore = useUser()
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div class="max-w-full overflow-x-auto custom-scrollbar">
      <table class="min-w-full text-sm">
        <thead>
          <tr class="border-b border-gray-200 bg-gray-50">
            <th class="px-5 py-3 text-left whitespace-nowrap">#</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Profile</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Email</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Gender</th>
            <th class="px-5 py-3 text-left whitespace-nowrap">Status</th>
            <th class="px-5 py-3 text-left whitespace-nowrap"></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-200">
          <tr
            v-for="(user, index) in usersStore.users"
            :key="user.id"
          >
            <!-- Index -->
            <td class="px-5 py-4">{{ index + 1 }}</td>

            <!-- Avatar + Name + Role -->
            <td class="px-5 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    :src="user.avatar || (user.gender === 'male' ? maleAvatar : femaleAvatar)"
                    :alt="user.name ?? 'User Avatar'"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <span class="block font-medium">{{ user.name }}</span>
                  <span class="block text-gray-500">
                    {{ user.role?.name
                      ? user.role.name.charAt(0).toUpperCase() + user.role.name.slice(1)
                      : '—' }}
                  </span>
                </div>
              </div>
            </td>

            <!-- Email -->
            <td class="px-5 py-4 whitespace-nowrap">{{ user.email }}</td>

            <!-- Gender -->
            <td class="px-5 py-4 whitespace-nowrap">
              {{ user.gender
                ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1)
                : '—' }}
            </td>

            <!-- Status -->
            <td class="px-5 py-4 whitespace-nowrap">
              <span
                :class="[
                  'rounded-full px-2 py-0.5 text-xs font-medium',
                  user.status.toLowerCase() === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700',
                ]"
              >
                {{ user.status
                  ? user.status.charAt(0).toUpperCase() + user.status.slice(1)
                  : '—' }}
              </span>
            </td>

            <!-- Actions -->
            <td class="px-5 py-4">
              <div class="flex gap-2">
                <button
                  @click="usersStore.openModal('view', user)"
                  class="p-1 rounded hover:bg-gray-100"
                  title="View"
                >
                  👁
                </button>
                <button
                  @click="usersStore.openModal('edit', user)"
                  class="p-1 rounded hover:bg-gray-100"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  @click="usersStore.openModal('delete', user)"
                  class="p-1 rounded hover:bg-gray-100 text-red-600"
                  title="Delete"
                >
                  🗑
                </button>
              </div>
            </td>
          </tr>

          <!-- Loading / Empty State -->
          <tr v-if="usersStore.loading">
            <td colspan="6" class="px-5 py-4 text-center text-gray-500">
              Loading users...
            </td>
          </tr>
          <tr v-else-if="!usersStore.loading && !usersStore.users?.length">
            <td colspan="6" class="px-5 py-4 text-center text-gray-500">
              No user found
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
