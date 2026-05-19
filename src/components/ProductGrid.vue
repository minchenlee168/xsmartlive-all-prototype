<script setup lang="ts">
import { computed } from 'vue'
import ProductCard from './ProductCard.vue'
import { useViewportStore } from '../stores/viewport'
import { products } from '../data/products'

const vp = computed(() => useViewportStore().current.id)
const gridCols = computed(() => ({
  'grid-cols-2': vp.value === 'mobile',
  'grid-cols-3': vp.value === 'tablet',
  'grid-cols-5': vp.value === 'pc',
}))

const displayProducts = products.slice(0, 10)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="grid gap-3" :class="gridCols">
      <ProductCard
        v-for="p in displayProducts"
        :key="p.id"
        :id="p.id"
        :name="p.name"
        :price="p.price"
        :original="p.original"
        :has-variant="p.hasVariant"
        :stock="p.stock"
        :image="p.image"
      />
    </div>

    <!-- Loading spinner -->
    <div class="flex items-center justify-center h-[100px] @lg:h-[235px]">
      <div class="w-10 h-10 @lg:w-12 @lg:h-12 rounded-full animate-spin" style="border: 4px solid var(--primary-200); border-top-color: var(--primary)" />
    </div>
  </div>
</template>
