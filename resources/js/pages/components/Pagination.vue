<script setup lang="ts">
import { computed, ref, watch, getCurrentInstance } from 'vue';
import { router } from '@inertiajs/vue3';

/**
 * Pagination link type (matches Laravel / Inertia meta.links)
 */
interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

/**
 * Props
 */
const props = withDefaults(
  defineProps<{
    links?: PaginationLink[];
    currentPage?: number;
    totalPages?: number;
  }>(),
  {
    links: () => [],
    currentPage: 1,
    totalPages: 1
  }
);

/**
 * Emits
 */
const emit = defineEmits<{
  (e: 'change', page: number): void;
}>();

/**
 * Detect if parent listens for `change`
 */
const instance = getCurrentInstance();
const hasChangeListener = computed(() => !!instance?.vnode.props?.onChange);

/**
 * Internal page state
 */
const internalPage = ref<number>(props.currentPage);
watch(() => props.currentPage, (val) => {
  internalPage.value = val;
});

/**
 * Backend pagination detection
 */
const hasBackendLinks = computed(() => props.links.length > 0 && 'url' in props.links[0]);
const currentPageForRender = computed(() => internalPage.value);

/**
 * Extract page number from Inertia URL
 */
function extractPage(url?: string | null): number {
  if (!url) return 1;
  try {
    const params = new URL(url, window.location.origin).searchParams;
    return parseInt(params.get('page') || '1', 10);
  } catch {
    return 1;
  }
}

/**
 * Handle page click
 */
function handleClick(page?: number, url?: string | null): void {
  const newPage = url ? extractPage(url) : page ?? internalPage.value;

  if (hasChangeListener.value) {
    emit('change', newPage);
    internalPage.value = newPage;
  } else if (hasBackendLinks.value && url) {
    router.get(url, {}, { 
      preserveState: true,
      preserveScroll: true
    });
  } else {
    internalPage.value = newPage;
  }
}
</script>

<template>
  <div
    v-if="(hasBackendLinks && links.filter(l => l.url).length > 1) || (!hasBackendLinks && totalPages > 1)" 
    class="flex flex-wrap gap-1 mt-4"
  >

    <!-- Backend Links -->
    <template v-if="hasBackendLinks">
      <template v-for="(link, index) in links" :key="index">
        <button
          v-html="link.label"
          class="px-3 py-1 border rounded text-sm transition-colors"
          :class="{
            'bg-primary text-white border-primary': link.active,
            'text-gray-500 cursor-not-allowed border-gray-300': !link.url,
            'hover:bg-primary hover:text-white hover:border-primary cursor-pointer': link.url && !link.active
          }"
          :disabled="!link.url"
          @click="link.url ? handleClick(undefined, link.url) : null"
        />
      </template>
    </template>

    <!-- Local Numeric Pagination -->
    <template v-else>
      <button
        @click="handleClick(currentPageForRender - 1)"
        :disabled="currentPageForRender === 1"
        class="px-3 py-1 border rounded text-sm transition-colors"
        :class="{
          'text-gray-500 cursor-not-allowed border-gray-300': currentPageForRender === 1,
          'hover:bg-gray-200 hover:text-gray-600 border-gray-300': currentPageForRender !== 1
        }"
      >&#171; Previous</button>

      <button
        v-for="page in totalPages"
        :key="page"
        @click="handleClick(page)"
        class="px-3 py-1 border rounded text-sm transition-colors"
        :class="{
          'bg-primary text-white border-primary': currentPageForRender === page,
          'text-gray-700 border-gray-300 hover:bg-gray-200 hover:text-gray-600': currentPageForRender !== page
        }"
      >{{ page }}</button>

      <button
        @click="handleClick(currentPageForRender + 1)"
        :disabled="currentPageForRender === totalPages"
        class="px-3 py-1 border rounded text-sm transition-colors"
        :class="{
          'text-gray-500 cursor-not-allowed border-gray-300': currentPageForRender === totalPages,
          'hover:bg-gray-200 hover:text-gray-600 border-gray-300': currentPageForRender !== totalPages
        }"
      >Next &#187;</button>
    </template>

  </div>
</template>
