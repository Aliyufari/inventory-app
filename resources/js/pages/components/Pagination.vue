<script setup lang="ts">
import { Button } from '@/components/ui/button'

interface PaginationLink {
  url: string | null
  label: string
  active: boolean
}

interface PaginationMeta {
  current_page: number
  from: number
  to: number
  total: number
  last_page: number
}

interface Props {
  links: PaginationLink[]
  meta?: PaginationMeta
  /**
   * Callback to fetch a specific page
   */
  onPageChange: (page: number) => void
}

const props = defineProps<Props>()

/**
 * Extract page number from Laravel pagination URL
 */
const getPageNumber = (url: string | null): number | null => {
  if (!url) return null
  const match = url.match(/page=(\d+)/)
  return match ? parseInt(match[1], 10) : 1
}

/**
 * Format pagination links with ellipsis logic
 */
const paginationRange = (links: PaginationLink[]) => {
  const totalPages = links.length
  const currentPageIndex = links.findIndex(link => link.active)
  const maxVisiblePages = 5

  if (totalPages <= maxVisiblePages) return links

  const startPages = links.slice(0, 2)
  const endPages = links.slice(-2)
  let middlePages: PaginationLink[] = []

  if (currentPageIndex <= 2) {
    middlePages = links.slice(2, currentPageIndex + 3)
  } else if (currentPageIndex >= totalPages - 3) {
    middlePages = links.slice(currentPageIndex - 2, totalPages - 2)
  } else {
    middlePages = links.slice(currentPageIndex - 1, currentPageIndex + 2)
  }

  const leadingEllipsis =
    currentPageIndex > 2 ? [{ label: '...', url: null, active: false }] : []
  const trailingEllipsis =
    currentPageIndex < totalPages - 3 ? [{ label: '...', url: null, active: false }] : []

  return [
    ...startPages,
    ...leadingEllipsis,
    ...middlePages,
    ...trailingEllipsis,
    ...endPages,
  ].filter((page, index, array) => index === 0 || page.label !== array[index - 1].label)
}
</script>

<template>
  <div v-if="links.length > 3" class="mt-6 flex flex-col items-center gap-3">
    <!-- Info line -->
    <p v-if="meta" class="text-sm text-gray-600">
      Showing <span class="font-medium">{{ meta.from }}</span>
      to <span class="font-medium">{{ meta.to }}</span>
      of <span class="font-medium">{{ meta.total }}</span> results
    </p>

    <!-- Pagination buttons -->
    <nav class="flex items-center space-x-1" aria-label="Pagination">
      <template v-for="(link, index) in paginationRange(links)" :key="index">
        <!-- Active & Clickable Links -->
        <Button
          v-if="link.url"
          @click="props.onPageChange(getPageNumber(link.url) || 1)"
          v-html="link.label"
          :variant="link.active ? 'default' : 'outline'"
          size="sm"
        />

        <!-- Disabled or Ellipsis -->
        <span
          v-else
          v-html="link.label"
          class="px-3 py-1 text-sm text-gray-400 cursor-default"
        />
      </template>
    </nav>
  </div>
</template>
