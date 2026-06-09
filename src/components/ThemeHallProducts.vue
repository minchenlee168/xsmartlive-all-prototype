<script setup lang="ts">
import { computed } from 'vue'
import ProductCard from './ProductCard.vue'
import { useViewportStore } from '../stores/viewport'
import { products } from '../data/products'

const props = defineProps<{
  /** 後台開啟輪播功能 → 商品自動輪播（固定時間）；否則僅手動左右切換 */
  autoplay?: boolean
  /** 精簡商品卡：不顯示數量選擇器與「還剩X件」 */
  simple?: boolean
}>()

const vp = computed(() => useViewportStore().current.id)
// 一排顯示張數（PC 5 / 平板 3 / 手機 2）；商品共 10 個，超過可顯示數即用左右箭頭切換
const perView = computed(() => (vp.value === 'mobile' ? 2 : vp.value === 'tablet' ? 3 : 5))
const items = products.slice(0, 10)
</script>

<template>
  <Carousel
    :value="items"
    :num-visible="perView"
    :num-scroll="1"
    :circular="props.autoplay"
    :autoplay-interval="props.autoplay ? 3000 : undefined"
  >
    <template #item="{ data }">
      <div class="px-2 h-full">
        <ProductCard
          :id="data.id"
          :name="data.name"
          :price="data.price"
          :original="data.original"
          :has-variant="data.hasVariant"
          :stock="data.stock"
          :image="data.image"
          :simple="props.simple"
        />
      </div>
    </template>
  </Carousel>
</template>

<style scoped>
/* 讓每個輪播項目等高，卡片才能撐滿（選擇規格的卡少了數量區塊也會同高） */
:deep(.p-carousel-item) {
  display: flex;
  align-items: stretch;
}
</style>
