<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import CategoryTabs from '../components/CategoryTabs.vue'
import CouponDrawer from '../components/CouponDrawer.vue'
import { useViewportStore } from '../stores/viewport'
import { useCartStore } from '../stores/cart'
import { useUiStore } from '../stores/ui'
import { products } from '../data/products'

const route = useRoute()
const router = useRouter()
const cart = useCartStore()
const vp = computed(() => useViewportStore().current.id)
const isPC = computed(() => vp.value === 'pc')
const isMobile = computed(() => vp.value === 'mobile')

const product = computed(() => products.find(p => p.id === Number(route.params.id)) ?? products[0])
const selectedSize = ref(product.value.sizes?.[0] ?? '')
const qty = ref(1)
const activeThumb = ref(0)

const thumbCount = computed(() => isPC.value ? 5 : isMobile.value ? 3 : 4)
const showCouponDrawer = ref(false)
const ui = useUiStore()

function shareTo(platform: 'facebook' | 'line' | 'instagram' | 'link') {
  const url = window.location.href
  if (platform === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,width=600,height=500')
  } else if (platform === 'line') {
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`, '_blank', 'noopener,width=600,height=500')
  } else if (platform === 'instagram') {
    ui.toast('Instagram 不支援網頁分享，請截圖分享')
  } else {
    navigator.clipboard?.writeText(url).then(
      () => ui.toast('已複製商品連結'),
      () => ui.toast('複製失敗，請手動複製網址'),
    )
  }
}
</script>

<template>
  <div class="min-h-screen" style="background: var(--page-bg)">
    <NavBar />
    <CategoryTabs />

    <main class="max-w-[1280px] mx-auto" style="padding: var(--page-pad-y) var(--page-pad-x)">
      <div class="flex flex-col" style="gap: var(--stack-gap)">

        <!-- Breadcrumb -->
        <nav class="flex items-center gap-[7px] text-sm flex-wrap py-1">
          <button class="text-[#64748b] hover:text-[color:var(--primary)] transition-colors" @click="router.push('/')">
            <i class="pi pi-home text-xs" />
          </button>
          <i class="pi pi-chevron-right text-[10px] text-[#94a3b8]" />
          <button
            v-if="product.category"
            style="color: var(--primary)"
            class="font-medium hover:underline"
            @click="router.push(`/category/${encodeURIComponent(product.category!)}`)"
          >{{ product.category }}</button>
          <i class="pi pi-chevron-right text-[10px] text-[#94a3b8]" />
          <span class="text-[#64748b] line-clamp-1">{{ product.name }}</span>
        </nav>

        <!-- Product card -->
        <div class="bg-white rounded-[12px] shadow-[0px_1px_2px_rgba(0,0,0,0.1),0px_1px_3px_rgba(0,0,0,0.1)] p-[17.5px]">
          <div class="flex flex-col gap-6">
          <div class="flex gap-6" :class="isMobile ? 'flex-col' : 'flex-row items-start'">

            <!-- Left: main image + thumbnails -->
            <div class="flex flex-col gap-3" :class="isPC ? 'w-[513px] shrink-0' : isMobile ? 'w-full' : 'w-[320px] shrink-0'">
              <!-- Main image -->
              <div class="w-full bg-[#d9d9d9] rounded-[8px] overflow-hidden flex items-center justify-center"
                   :class="isPC ? 'h-[512px]' : isMobile ? 'h-[280px]' : 'h-[320px]'">
                <img v-if="product.image" :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
                <i v-else class="pi pi-image text-[#aaa]" :class="isPC ? 'text-6xl' : 'text-5xl'" />
              </div>

              <!-- Thumbnails -->
              <div class="flex items-center gap-1">
                <button
                  class="flex items-center justify-center w-7 h-7 rounded-[6px] hover:bg-gray-100 shrink-0 text-[#64748b]"
                  @click="activeThumb = (activeThumb - 1 + thumbCount) % thumbCount"
                >
                  <i class="pi pi-chevron-left text-xs" />
                </button>
                <div class="flex flex-1 justify-between gap-1.5">
                  <div
                    v-for="i in thumbCount"
                    :key="i"
                    class="flex-1 aspect-square bg-[#d9d9d9] rounded-[6px] overflow-hidden cursor-pointer transition-all"
                    :class="activeThumb === i - 1 ? 'ring-2' : 'opacity-70 hover:opacity-100'"
                    :style="activeThumb === i - 1 ? 'outline: 2px solid var(--primary)' : ''"
                    @click="activeThumb = i - 1"
                  >
                    <img v-if="i === 1 && product.image" :src="product.image" :alt="product.name" class="w-full h-full object-cover" />
                  </div>
                </div>
                <button
                  class="flex items-center justify-center w-7 h-7 rounded-[6px] hover:bg-gray-100 shrink-0 text-[#64748b]"
                  @click="activeThumb = (activeThumb + 1) % thumbCount"
                >
                  <i class="pi pi-chevron-right text-xs" />
                </button>
              </div>
            </div>

            <!-- Right: product info -->
            <div class="flex-1 flex flex-col gap-4 min-w-0">

              <!-- Name -->
              <h1 class="font-bold text-[#020617] leading-snug text-2xl">
                {{ product.name }}
              </h1>

              <!-- Price block -->
              <div class="bg-[#f7f7f7] rounded-[8px] px-3 py-5 flex items-end gap-4">
                <span class="font-bold leading-none" style="color: var(--primary)" :class="isPC ? 'text-[32px]' : 'text-2xl'">
                  ${{ product.price }}
                </span>
                <span class="font-medium text-[#64748b] line-through" :class="isPC ? 'text-[20px]' : 'text-base'">
                  ${{ product.original }}
                </span>
              </div>

              <!-- Coupon -->
              <div class="flex items-center gap-6">
                <span class="text-sm text-[#334155] w-[80px] shrink-0">賣場優惠券</span>
                <span v-if="product.noCoupon || product.isBundle" class="text-sm text-[#334155] px-3">
                  ＊已為優惠商品，不適用任何優惠券
                </span>
                <button
                  v-else
                  class="flex items-center gap-1.5 text-sm font-medium transition-colors hover:underline"
                  style="color: var(--primary)"
                  @click="showCouponDrawer = true"
                >
                  查看可使用的優惠券
                  <i class="pi pi-arrow-up-right text-xs" />
                </button>
              </div>

              <!-- Size (hidden for bundle products) -->
              <div class="flex items-center gap-6" v-if="!product.isBundle && product.hasVariant && product.sizes?.length">
                <span class="text-sm text-[#334155] w-[80px] shrink-0">尺碼</span>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="size in product.sizes"
                    :key="size"
                    class="px-[13px] py-[9px] rounded-[6px] text-sm font-medium border transition-colors"
                    :style="selectedSize === size
                      ? { borderColor: 'var(--primary-200)', color: 'var(--primary)', background: 'transparent' }
                      : { borderColor: '#f1f5f9', color: '#475569', background: '#f1f5f9' }"
                    @click="selectedSize = size"
                  >
                    {{ size }}
                  </button>
                </div>
              </div>

              <!-- Quantity -->
              <div class="flex items-center gap-6">
                <span class="text-sm text-[#334155] w-[80px] shrink-0">數量</span>
                <div class="flex items-center gap-4">
                  <div class="flex items-center">
                    <button
                      class="w-[35px] h-[34px] border border-[#cbd5e1] rounded-l-[6px] flex items-center justify-center hover:bg-gray-50 transition-colors"
                      @click="qty > 1 && qty--"
                    >
                      <i class="pi pi-minus text-xs text-[#334155]" />
                    </button>
                    <input
                      v-model="qty"
                      type="number"
                      class="w-[48px] h-[34px] border-y border-[#cbd5e1] text-center text-sm text-[#334155] outline-none bg-white shadow-[0px_1px_1px_rgba(18,18,23,0.05)]"
                    />
                    <button
                      class="w-[35px] h-[34px] border border-[#cbd5e1] rounded-r-[6px] flex items-center justify-center hover:bg-gray-50 transition-colors"
                      @click="qty++"
                    >
                      <i class="pi pi-plus text-xs text-[#334155]" />
                    </button>
                  </div>
                  <span class="text-sm text-[#334155]">還剩{{ product.stock ?? 1 }}{{ product.isBundle ? '組' : '件' }}</span>
                </div>
              </div>

              <!-- Add to cart -->
              <div class="flex items-center">
                <button
                  class="flex items-center gap-[7px] px-[13px] py-[10px] rounded-[6px] text-sm font-medium text-white transition-colors"
                  style="background: var(--primary-bg)"
                  @mouseover="($event.currentTarget as HTMLElement).style.background = 'var(--primary-hover-bg)'"
                  @mouseleave="($event.currentTarget as HTMLElement).style.background = 'var(--primary-bg)'"
                  @click="cart.addItem({ id: product.id, name: product.name, price: product.price, original: product.original, image: product.image }, selectedSize || '預設', qty)"
                >
                  <i class="pi pi-cart-plus text-sm" />
                  加入購物車
                </button>
              </div>

              <!-- Share -->
              <div class="flex items-center gap-0 pt-1 border-t border-[#e2e8f0]">
                <button class="flex items-center gap-2 px-3 py-2 rounded-[6px] hover:bg-gray-50 text-sm font-medium text-[#334155] transition-colors" @click="shareTo('facebook')">
                  <i class="pi pi-facebook text-[#1877F2] text-base" />
                  分享
                </button>
                <div class="w-px h-5 bg-[#e2e8f0]" />
                <button class="flex items-center gap-2 px-3 py-2 rounded-[6px] hover:bg-gray-50 text-sm font-medium text-[#334155] transition-colors" @click="shareTo('line')">
                  <span class="text-[#00B900] text-base font-bold leading-none">L</span>
                  分享
                </button>
                <div class="w-px h-5 bg-[#e2e8f0]" />
                <button class="flex items-center gap-2 px-3 py-2 rounded-[6px] hover:bg-gray-50 text-sm font-medium text-[#334155] transition-colors" @click="shareTo('instagram')">
                  <i class="pi pi-instagram text-[#E1306C] text-base" />
                  分享
                </button>
                <div class="w-px h-5 bg-[#e2e8f0]" />
                <button class="flex items-center gap-2 px-3 py-2 rounded-[6px] hover:bg-gray-50 text-sm font-medium text-[#334155] transition-colors" @click="shareTo('link')">
                  <i class="pi pi-link text-base" style="color: var(--primary)" />
                  連結分享
                </button>
              </div>

            </div>
          </div>

          <!-- Bundle items section -->
          <div v-if="product.isBundle && product.bundleItems?.length" class="flex flex-col gap-4">
            <!-- Section header -->
            <div
              class="flex items-center px-4 py-2 rounded-t-[4px] border-b-2"
              style="background: color-mix(in srgb, var(--primary) 8%, transparent); border-color: var(--primary)"
            >
              <span class="text-[18px] font-semibold text-[#334155]">組合商品內容</span>
            </div>

            <!-- Items grid -->
            <div class="flex flex-wrap gap-4">
              <div
                v-for="(item, idx) in product.bundleItems"
                :key="idx"
                class="flex flex-col gap-[7px] p-2 rounded-[8px]"
                :class="isPC ? 'w-[243px]' : 'w-[160px]'"
              >
                <!-- Image -->
                <div class="aspect-[332/320] w-full bg-[#d9d9d9] rounded-[8px] overflow-hidden">
                  <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                    <i class="pi pi-image text-2xl" />
                  </div>
                </div>
                <!-- Info -->
                <div class="flex flex-col gap-2 p-2">
                  <p class="text-[#020617] leading-snug line-clamp-2" :class="isPC ? 'text-[16px]' : 'text-sm'">{{ item.name }}</p>
                  <div class="flex flex-col gap-1 text-sm text-[#334155]">
                    <div class="flex gap-4">
                      <span>規格</span>
                      <span>{{ item.spec }}</span>
                    </div>
                    <div class="flex gap-4">
                      <span>數量</span>
                      <span>{{ item.qty }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          </div><!-- /flex-col gap-6 -->
        </div>

      </div>
    </main>
  </div>

  <CouponDrawer v-if="showCouponDrawer" @close="showCouponDrawer = false" />
</template>
