<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import CategoryTabs from '../components/CategoryTabs.vue'
import { useViewportStore } from '../stores/viewport'
import { useCartStore, type CartGroup } from '../stores/cart'

const router = useRouter()
const vp = computed(() => useViewportStore().current.id)
const isPC = computed(() => vp.value === 'pc')

const cart = useCartStore()
const groups = computed(() => cart.groups)

function isGroupAllChecked(group: CartGroup) {
  return group.items.length > 0 && group.items.every(i => i.checked)
}
function toggleGroupAll(group: CartGroup) {
  const all = isGroupAllChecked(group)
  group.items.forEach(i => { i.checked = !all })
}
const globalAllChecked = computed(() => groups.value.every(g => isGroupAllChecked(g)))
function toggleGlobalAll() {
  const all = globalAllChecked.value
  groups.value.forEach(g => g.items.forEach(i => { i.checked = !all }))
}
function groupSubtotal(group: CartGroup) {
  return group.items.filter(i => i.checked).reduce((s, i) => s + i.price * i.qty, 0)
}
const globalTotal = computed(() =>
  groups.value.reduce((s, g) => s + groupSubtotal(g), 0)
)
const isEmpty = computed(() => groups.value.every(g => g.items.length === 0))
function removeItem(group: CartGroup, id: string) {
  cart.removeItem(group.id, id)
}
function isGroupLocked(group: CartGroup) {
  return group.tags.some(t => t.label === '禁止棄標')
}
function goCheckout() {
  router.push('/checkout')
}

const tagClass: Record<string, string> = {
  info:      'bg-[#e0f2fe] text-[#0369a1]',
  danger:    'bg-[#fee2e2] text-[#b91c1c]',
  secondary: 'bg-[#f1f5f9] text-[#475569]',
}
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background: var(--page-bg)">
    <NavBar />
    <CategoryTabs />

    <!-- Page header -->
    <div>
      <div class="max-w-[1280px] mx-auto px-4 py-[22px] flex items-center gap-3">
        <button
          class="flex items-center justify-center w-8 h-8 rounded-[6px] hover:bg-gray-100 text-[#334155] transition-colors"
          @click="router.back()"
        >
          <i class="pi pi-arrow-left text-sm" />
        </button>
        <h1 class="font-bold text-[#020617]" :class="isPC ? 'text-2xl' : 'text-xl'">購物車結帳</h1>
      </div>
    </div>

    <!-- Empty state -->
    <main v-if="isEmpty" class="flex-1 max-w-[1280px] w-full mx-auto flex flex-col items-center justify-center min-h-[400px]" style="padding: var(--page-pad-y) var(--page-pad-x)">
      <div class="flex flex-col items-center gap-4">
        <div class="relative">
          <i class="pi pi-shopping-cart" style="font-size: 96px; color: #6b7280" />
          <span class="absolute left-1/2 -translate-x-1/2 font-black select-none" style="top: 8%; font-size: 44px; color: #1f2937">?</span>
        </div>
        <p class="text-base" style="color: #6b7280">購物車內無任何商品</p>
      </div>
    </main>

    <!-- Content -->
    <main v-else class="flex-1 max-w-[1280px] w-full mx-auto flex flex-col" style="padding: var(--page-pad-y) var(--page-pad-x); gap: var(--stack-gap)">
      <div
        v-for="group in groups"
        :key="group.id"
        class="bg-white rounded-[12px] shadow-[0px_1px_2px_rgba(0,0,0,0.1),0px_1px_3px_rgba(0,0,0,0.1)]"
      >
        <!-- Group header -->
        <div class="cart-divider flex items-center gap-4 px-[var(--card-pad)] py-[var(--card-pad)]">
          <!-- Group select-all checkbox -->
          <button
            class="flex items-center gap-2 shrink-0"
            @click="toggleGroupAll(group)"
          >
            <div
              class="w-[17.5px] h-[17.5px] rounded-[4px] border flex items-center justify-center transition-colors"
              :style="isGroupAllChecked(group)
                ? 'background: var(--primary); border-color: var(--primary)'
                : 'background: white; border-color: #cbd5e1'"
            >
              <i v-if="isGroupAllChecked(group)" class="pi pi-check text-white" style="font-size: 10px" />
            </div>
            <span class="text-sm text-[#334155]">全選</span>
          </button>
          <span class="font-medium text-[17.5px] text-[#334155]">{{ group.sellerName }}</span>
          <div class="flex items-center gap-2">
            <span
              v-for="tag in group.tags"
              :key="tag.label"
              class="px-[7px] py-[3.5px] rounded-[6px] text-[12.25px] font-bold"
              :class="tagClass[tag.type]"
            >{{ tag.label }}</span>
          </div>
        </div>

        <!-- Items -->
        <div v-for="(item, ii) in group.items" :key="item.id" :class="ii !== group.items.length - 1 ? 'cart-divider' : ''">
          <!-- Item row -->
          <div class="flex items-center gap-4 px-[var(--card-pad)] py-[var(--card-pad)]" :class="isPC ? 'gap-[14px]' : 'gap-3'">
            <!-- Checkbox -->
            <button class="shrink-0" @click="item.checked = !item.checked">
              <div
                class="w-[17.5px] h-[17.5px] rounded-[4px] border flex items-center justify-center transition-colors"
                :style="item.checked
                  ? 'background: var(--primary); border-color: var(--primary)'
                  : 'background: white; border-color: #cbd5e1'"
              >
                <i v-if="item.checked" class="pi pi-check text-white" style="font-size: 10px" />
              </div>
            </button>

            <!-- Image -->
            <div
              class="shrink-0 bg-[#d9d9d9] rounded-[4px] overflow-hidden aspect-square"
              :class="isPC ? 'w-[100px]' : vp === 'tablet' ? 'w-[80px]' : 'w-[64px]'"
            >
              <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0 flex" :class="isPC ? 'items-center gap-4' : 'flex-col gap-1'">
              <div class="flex-1 min-w-0 flex flex-col gap-1">
                <p class="font-semibold text-[#334155] truncate text-[16px]">
                  {{ item.name }}
                </p>
                <div class="flex gap-4 text-[#334155] text-[14px]">
                  <span>規格</span>
                  <span>{{ item.spec }}</span>
                </div>
                <div class="flex items-center gap-4 text-[14px]">
                  <span class="text-[#334155]">數量</span>
                  <div class="flex items-center">
                    <button
                      class="w-[35px] h-[33px] border border-[#cbd5e1] rounded-l-[6px] flex items-center justify-center hover:bg-gray-50"
                      @click="item.qty > 1 && item.qty--"
                    >
                      <i class="pi pi-minus text-[#334155]" style="font-size: 10px" />
                    </button>
                    <input
                      v-model.number="item.qty"
                      type="number"
                      class="qty-input w-[31px] h-[33px] border-y border-[#cbd5e1] text-center text-sm text-[#334155] outline-none bg-white"
                    />
                    <button
                      class="w-[35px] h-[33px] border border-[#cbd5e1] rounded-r-[6px] flex items-center justify-center hover:bg-gray-50"
                      @click="item.qty++"
                    >
                      <i class="pi pi-plus text-[#334155]" style="font-size: 10px" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Price + Delete -->
              <div class="flex items-center justify-between shrink-0" :class="isPC ? 'flex-col items-end gap-4' : 'mt-1'">
                <div class="flex flex-col items-end">
                  <span v-if="item.original" class="text-sm text-[#64748b] line-through">${{ item.original }}</span>
                  <span class="font-medium leading-none" style="color: var(--primary)" :class="isPC ? 'text-[24px]' : 'text-base'">${{ item.price }}</span>
                </div>
                <button
                  v-if="!isGroupLocked(group)"
                  class="flex items-center gap-1.5 px-[10.5px] py-[7px] rounded-[6px] hover:bg-red-50 transition-colors text-[#ef4444] text-sm font-medium"
                  @click="removeItem(group, item.id)"
                >
                  <i class="pi pi-trash" style="font-size: 13px" />
                  刪除
                </button>
              </div>
            </div>
          </div>

          <!-- Bundle fieldset -->
          <div v-if="item.isBundle" class="px-[var(--card-pad)] pb-[16px] pl-[36px] pt-[15px]">
            <div class="relative border border-[#e2e8f0] rounded-[6px] bg-white pt-4 px-[16.75px] pb-[16.75px]">
              <!-- Legend button -->
              <button
                class="absolute border-0 rounded-[6px] px-[11.5px] py-[8px] flex items-center gap-[7px] text-[14px] font-black text-[#334155] transition-colors hover:text-[var(--primary)]"
                style="top: -17.75px; left: 15.75px; background: transparent"
                @click="item.bundleExpanded = !item.bundleExpanded"
              >
                <i class="pi text-xs" :class="item.bundleExpanded ? 'pi-minus' : 'pi-plus'" />
                組合商品內容
              </button>
              <!-- Sub-items grid -->
              <div v-if="item.bundleExpanded" class="grid gap-4" :class="isPC ? 'grid-cols-2' : 'grid-cols-1'">
                <div
                  v-for="(sub, si) in item.bundleItems"
                  :key="si"
                  class="bg-[#f1f5f9] rounded-[12px] p-[var(--card-pad)] flex items-center gap-4 shadow-[0px_1px_2px_rgba(0,0,0,0.1)]"
                >
                  <div class="w-[80px] h-[80px] shrink-0 bg-[#d9d9d9] rounded-[4px] overflow-hidden">
                    <img v-if="sub.image" :src="sub.image" :alt="sub.name" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex flex-col gap-1 min-w-0 flex-1">
                    <p class="font-semibold text-[16px] text-[#334155] truncate">{{ sub.name }}</p>
                    <div class="flex gap-4 text-[14px] text-[#334155]">
                      <span>規格</span><span>{{ sub.spec }}</span>
                    </div>
                    <div class="flex gap-4 text-[14px] text-[#334155]">
                      <span>數量</span><span>{{ sub.qty }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Group subtotal -->
        <div class="cart-divider-top flex items-center justify-end gap-4 px-[var(--card-pad)] py-4">
          <span class="text-[18px] text-[#334155]">訂單金額小計</span>
          <span class="text-[30px] font-bold" style="color: var(--primary)">${{ groupSubtotal(group).toLocaleString() }}</span>
        </div>
      </div>
    </main>

    <!-- Sticky footer -->
    <div v-if="!isEmpty" class="sticky bottom-0 z-40 bg-white border-t border-b border-[#e2e8f0]">
      <div class="max-w-[1280px] mx-auto px-4 py-[18px] flex items-center justify-between">
        <!-- Global select all -->
        <button class="flex items-center gap-2" @click="toggleGlobalAll">
          <div
            class="w-[21px] h-[21px] rounded-[4px] border flex items-center justify-center transition-colors"
            :style="globalAllChecked
              ? 'background: var(--primary); border-color: var(--primary)'
              : 'background: white; border-color: #cbd5e1'"
          >
            <i v-if="globalAllChecked" class="pi pi-check text-white" style="font-size: 11px" />
          </div>
          <span class="text-[15.75px] text-[#334155]">選擇全部購物車</span>
        </button>

        <!-- Total + checkout -->
        <div class="flex items-center gap-8">
          <div class="flex items-center gap-4">
            <span class="text-[18px] text-[#334155]">訂單總金額</span>
            <span class="text-[30px] font-bold" style="color: var(--primary)">${{ globalTotal.toLocaleString() }}</span>
          </div>
          <button
            class="px-16 py-[9.75px] rounded-[6px] text-white font-medium text-[15.75px] transition-colors"
            style="background: var(--primary-bg)"
            @mouseover="($event.currentTarget as HTMLElement).style.background = 'var(--primary-hover-bg)'"
            @mouseleave="($event.currentTarget as HTMLElement).style.background = 'var(--primary-bg)'"
            @click="goCheckout"
          >
            去結帳
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.qty-input {
  -moz-appearance: textfield;
  appearance: textfield;
}
.qty-input::-webkit-inner-spin-button,
.qty-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.cart-divider,
.cart-divider-top {
  position: relative;
}
.cart-divider::after,
.cart-divider-top::before {
  content: '';
  position: absolute;
  left: var(--card-pad);
  right: var(--card-pad);
  height: 1px;
  background: #e2e8f0;
}
.cart-divider::after { bottom: 0; }
.cart-divider-top::before { top: 0; }
</style>
