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
const checkedCount = computed(() =>
  groups.value.reduce((s, g) => s + g.items.filter(i => i.checked).length, 0)
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
function goProduct(productId?: number) {
  if (productId != null) router.push(`/product/${productId}`)
}
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background: var(--page-bg)">
    <NavBar />
    <CategoryTabs />

    <!-- Page header -->
    <div>
      <div class="max-w-[1280px] mx-auto px-4 py-[22px] flex items-center gap-3">
        <Button icon="pi pi-arrow-left" severity="secondary" text rounded @click="router.back()" />
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
    <main v-else class="flex-1 max-w-[1280px] w-full mx-auto flex flex-col" :style="{ padding: `0 ${isPC ? '0' : 'var(--page-pad-x)'} var(--page-pad-y)`, gap: 'var(--stack-gap)' }">
      <div
        v-for="group in groups"
        :key="group.id"
        class="bg-white rounded-[12px] shadow-[0px_1px_2px_rgba(0,0,0,0.1),0px_1px_3px_rgba(0,0,0,0.1)]"
      >
        <!-- Group header -->
        <div class="cart-divider flex items-center gap-4 px-[var(--card-pad)] py-[var(--card-pad)]">
          <!-- Group select-all checkbox -->
          <div class="flex items-center gap-2 shrink-0">
            <Checkbox
              :model-value="isGroupAllChecked(group)"
              binary
              :input-id="'grp-' + group.id"
              @update:model-value="toggleGroupAll(group)"
            />
            <label :for="'grp-' + group.id" class="text-sm text-[#334155] cursor-pointer">全選</label>
          </div>
          <span class="font-medium text-[17.5px] text-[#334155]">{{ group.sellerName }}</span>
          <div class="flex items-center gap-2">
            <Tag
              v-for="tag in group.tags"
              :key="tag.label"
              :value="tag.label"
              :severity="tag.type"
            />
          </div>
        </div>

        <!-- Items -->
        <div v-for="(item, ii) in group.items" :key="item.id" :class="ii !== group.items.length - 1 ? 'cart-divider' : ''">
          <!-- Item row -->
          <div class="flex items-center px-[var(--card-pad)] py-[var(--card-pad)]" :class="isPC ? 'gap-4' : 'gap-3'">
            <!-- Checkbox -->
            <Checkbox v-model="item.checked" binary class="shrink-0" />

            <!-- Image -->
            <div
              class="shrink-0 rounded-[4px] overflow-hidden aspect-square"
              :class="[
                isPC ? 'w-[100px]' : vp === 'tablet' ? 'w-[80px]' : 'w-[64px]',
                item.productId != null ? 'cursor-pointer' : '',
              ]"
              @click="goProduct(item.productId)"
            >
              <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-0.5">
                <i class="pi pi-hammer text-gray-300 text-lg" />
                <span class="text-gray-400 text-[10px]">圖片施工中</span>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0 flex" :class="isPC ? 'items-center gap-4' : 'flex-col gap-1'">
              <div class="flex-1 min-w-0 flex flex-col gap-1">
                <p
                  class="font-semibold text-[#334155] truncate text-[16px]"
                  :class="item.productId != null ? 'cursor-pointer hover:text-[color:var(--primary)] transition-colors' : ''"
                  @click="goProduct(item.productId)"
                >
                  {{ item.name }}
                </p>
                <div v-if="item.spec && item.spec !== '預設'" class="flex gap-4 text-[#334155]" :class="isPC ? 'text-[14px]' : 'text-base'">
                  <span>規格</span>
                  <span>{{ item.spec }}</span>
                </div>
                <div class="flex items-center gap-4" :class="isPC ? 'text-[14px]' : 'text-base'">
                  <span class="text-[#334155]">數量</span>
                  <InputNumber
                    v-model="item.qty"
                    :min="1"
                    show-buttons
                    button-layout="horizontal"
                    increment-button-icon="pi pi-plus"
                    decrement-button-icon="pi pi-minus"
                    class="qty-stepper"
                  />
                </div>
              </div>

              <!-- Price + Delete -->
              <div class="flex items-center justify-between shrink-0" :class="isPC ? 'flex-col items-end gap-4' : 'mt-1'">
                <div class="flex flex-col items-end">
                  <span v-if="item.original" class="text-sm text-[#64748b] line-through">${{ (item.original * item.qty).toLocaleString() }}</span>
                  <span class="font-medium leading-none" style="color: var(--primary)" :class="isPC ? 'text-[24px]' : 'text-base'">${{ (item.price * item.qty).toLocaleString() }}</span>
                </div>
                <Button
                  v-if="!isGroupLocked(group)"
                  label="刪除"
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  class="!min-h-[44px] !px-3"
                  @click="removeItem(group, item.id)"
                />
              </div>
            </div>
          </div>

          <!-- Bundle fieldset -->
          <div v-if="item.isBundle" class="px-[var(--card-pad)] pb-4 pl-9 pt-4">
            <div class="relative border border-[#e2e8f0] rounded-md bg-white pt-4 px-4 pb-4">
              <!-- Legend button -->
              <button
                class="absolute border-0 rounded-md px-3 py-2 flex items-center gap-2 text-[14px] font-black text-[#334155] transition-colors hover:text-[var(--primary)]"
                style="top: -18px; left: 16px; background: transparent"
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
                  class="bg-[#f1f5f9] rounded-xl p-[var(--card-pad)] flex items-center gap-4 shadow-[0px_1px_2px_rgba(0,0,0,0.1)]"
                >
                  <div class="w-[80px] h-[80px] shrink-0 bg-[#d9d9d9] rounded overflow-hidden">
                    <img v-if="sub.image" :src="sub.image" :alt="sub.name" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex flex-col gap-1 min-w-0 flex-1">
                    <p class="font-semibold text-[16px] text-[#334155] truncate">{{ sub.name }}</p>
                    <div v-if="sub.spec && sub.spec !== '預設'" class="flex gap-4 text-[14px] text-[#334155]">
                      <span>規格</span><span>{{ sub.spec }}</span>
                    </div>
                    <div class="flex gap-4 text-[14px] text-[#334155]">
                      <span>數量</span><span>{{ sub.qty * item.qty }}</span>
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
      <div
        class="max-w-[1280px] mx-auto px-4 py-3 flex items-center justify-between gap-3"
        style="padding-bottom: max(12px, env(safe-area-inset-bottom))"
      >
        <!-- Global select all -->
        <div class="flex items-center gap-2 shrink-0">
          <Checkbox
            :model-value="globalAllChecked"
            binary
            input-id="global-all"
            @update:model-value="toggleGlobalAll"
          />
          <label for="global-all" class="text-base text-[#334155] cursor-pointer whitespace-nowrap">
            {{ vp === 'mobile' ? '全選' : '選擇全部購物車' }}
          </label>
        </div>

        <!-- Total + checkout -->
        <div class="flex items-center min-w-0" :class="vp === 'mobile' ? 'gap-3' : 'gap-8'">
          <div class="flex items-baseline gap-2 min-w-0">
            <span v-if="vp !== 'mobile'" class="text-[18px] text-[#334155]">訂單總金額</span>
            <span class="font-bold truncate" :class="vp === 'mobile' ? 'text-2xl' : 'text-[30px]'" style="color: var(--primary)">${{ globalTotal.toLocaleString() }}</span>
          </div>
          <Button
            :label="checkedCount > 0 ? `去結帳 (${checkedCount})` : '去結帳'"
            class="!min-h-[48px] shrink-0"
            :class="vp === 'mobile' ? '!px-5' : 'px-16'"
            :disabled="checkedCount === 0"
            @click="goCheckout"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
