<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import CategoryTabs from '../components/CategoryTabs.vue'
import CategorySidebar from '../components/CategorySidebar.vue'
import ProductCard from '../components/ProductCard.vue'
import { useViewportStore } from '../stores/viewport'
import { products } from '../data/products'

const route = useRoute()
const router = useRouter()

const tab = computed(() => decodeURIComponent(route.params.tab as string))
const activeSubCategory = ref((route.query.sub as string) ?? '')
const sidebarOpen = ref(false)

watch(() => route.query.sub, (sub) => {
  activeSubCategory.value = (sub as string) ?? ''
})

const viewport = useViewportStore()
const vp = computed(() => viewport.current.id)
const gridCols = computed(() =>
  vp.value === 'pc' ? 'grid-cols-4' : vp.value === 'tablet' ? 'grid-cols-3' : 'grid-cols-2',
)

const pageProducts = products
</script>

<template>
  <div class="min-h-screen" style="background: var(--page-bg)">
    <NavBar />
    <CategoryTabs />

    <main class="max-w-[1280px] mx-auto" style="padding: var(--page-pad-y) var(--page-pad-x)">
      <div class="flex flex-col" style="gap: var(--stack-gap)">

        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-sm py-1">
          <button class="text-[#64748b] hover:text-[color:var(--primary)] transition-colors" @click="router.push('/')">
            <i class="pi pi-home text-xs" />
          </button>
          <i class="pi pi-chevron-right text-[10px] text-[#94a3b8]" />
          <span class="font-medium text-[#64748b]">{{ tab }}</span>
          <template v-if="activeSubCategory">
            <i class="pi pi-chevron-right text-[10px] text-[#94a3b8]" />
            <span class="text-[#64748b]">{{ activeSubCategory }}</span>
          </template>
        </nav>

        <!-- Filter button — mobile only -->
        <div v-if="vp === 'mobile'">
          <button
            class="flex items-center gap-2 px-4 min-h-[44px] py-2 rounded-md text-base font-medium text-white transition-colors"
            style="background: var(--primary-bg)"
            @click="sidebarOpen = !sidebarOpen"
            @mouseover="($event.currentTarget as HTMLElement).style.background = 'var(--primary-hover-bg)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background = 'var(--primary-bg)'"
          >
            <i class="pi pi-filter text-sm" />
            依分類篩選
            <i :class="`pi pi-chevron-${sidebarOpen ? 'up' : 'down'} text-xs`" />
          </button>

          <!-- Collapsible sidebar panel (mobile) -->
          <div v-if="sidebarOpen" class="mt-2">
            <CategorySidebar :tab="tab" v-model:active="activeSubCategory" />
          </div>
        </div>

        <!-- Content: sidebar + grid -->
        <div class="flex items-start gap-4">
          <!-- Sidebar — tablet+ inline -->
          <div v-if="vp !== 'mobile'" class="shrink-0">
            <CategorySidebar :tab="tab" v-model:active="activeSubCategory" />
          </div>

          <!-- Product grid -->
          <div class="flex-1 min-w-0">
            <div class="grid" :class="[gridCols, vp === 'mobile' ? 'gap-2' : 'gap-4']">
              <ProductCard
                v-for="product in pageProducts"
                :key="product.id"
                :id="product.id"
                :name="product.name"
                :price="product.price"
                :original="product.original"
                :has-variant="product.hasVariant"
                :stock="product.stock"
                :image="product.image"
              />
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
