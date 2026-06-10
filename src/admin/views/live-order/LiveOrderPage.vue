<template>
  <!-- 直播收單：自訂版型（多收單來源） -->
  <!-- 上：Banner（hasAnySource）；上：Toolbar；下：空狀態 OR 收單操作頁 -->

  <div class="flex flex-col gap-4 flex-1 min-h-0">

    <!-- ── Toolbar ─────────────────────────────────── -->
    <div class="flex items-center gap-2 flex-wrap">
      <SessionSelector
        :sessions="sessions"
        :selected="currentSession"
        :live-elapsed="elapsedDisplay"
        size="lg"
        @select="onSessionSelect"
        @create="createDialogVisible = true" />

      <span v-tooltip.bottom="currentSession ? '' : t('live_order.tooltip.pick_source_first')" class="inline-flex">
        <!-- SplitButton：主動作開「選擇商品」；下拉選擇「發放禮物」 -->
        <button
          @click="addProductDialogVisible = true"
          :disabled="!currentSession"
          :class="['border px-[11.5px] py-[8px] rounded-l-[6px] text-[14px] font-medium flex items-center gap-[7px] border-r-0',
            currentSession
              ? 'bg-[var(--p-content-background)] border-[var(--p-primary-color)] text-[var(--p-primary-color)] hover:bg-[var(--p-primary-50)]'
              : 'bg-[var(--p-content-hover-background)] border-[var(--p-content-border-color)] text-[var(--p-text-muted-color)] cursor-not-allowed']"
        >
          <i class="pi pi-plus" style="font-size:14px"></i>{{ t('live_order.button.add_product') }}
        </button>
        <button
          ref="addProductMenuTriggerRef"
          @click="openAddProductMenu"
          :disabled="!currentSession"
          aria-haspopup="true"
          aria-controls="add-product-menu"
          :class="['border px-[8px] py-[8px] rounded-r-[6px] text-[14px] font-medium flex items-center',
            currentSession
              ? 'bg-[var(--p-content-background)] border-[var(--p-primary-color)] text-[var(--p-primary-color)] hover:bg-[var(--p-primary-50)]'
              : 'bg-[var(--p-content-hover-background)] border-[var(--p-content-border-color)] text-[var(--p-text-muted-color)] cursor-not-allowed']"
        >
          <i class="pi pi-chevron-down" style="font-size:12px"></i>
        </button>
      </span>
      <Menu id="add-product-menu" ref="addProductMenuRef" :model="addProductMenuItems" :popup="true" />
      <span v-tooltip.bottom="currentSession ? '' : t('live_order.tooltip.pick_source_first')">
        <button @click="batchEditDialogVisible = true" :disabled="!currentSession"
          :class="['border px-[11.5px] py-[8px] rounded-[6px] text-[14px] font-medium flex items-center gap-[7px]',
            currentSession
              ? 'bg-[var(--p-content-background)] border-[var(--p-primary-color)] text-[var(--p-primary-color)] hover:bg-[var(--p-primary-50)]'
              : 'bg-[var(--p-content-hover-background)] border-[var(--p-content-border-color)] text-[var(--p-text-muted-color)] cursor-not-allowed']">
          <FontAwesomeIcon :icon="['far', 'gear']" class="text-[14px]" />{{ t('live_order.button.batch_edit') }}
        </button>
      </span>

      <!-- 商品狀態統計：跟功能鈕同列，緊跟 BatchEdit -->
      <div
        v-if="hasAnySource"
        class="flex items-center gap-3 px-3 py-1.5 rounded-[6px] border border-[var(--p-content-border-color)] bg-[var(--p-content-background)]"
      >
        <span
          v-tooltip.bottom="t('live_order.status.live')"
          class="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--p-primary-color)]"
        >
          <FontAwesomeIcon :icon="['far', 'circle-play']" class="text-[16px]" />
          {{ statusCounts.live }}
        </span>
        <span class="w-px h-3 bg-[var(--p-content-border-color)]" />
        <span
          v-tooltip.bottom="t('live_order.status.ready')"
          class="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--p-text-muted-color)]"
        >
          <FontAwesomeIcon :icon="['far', 'circle-pause']" class="text-[16px]" />
          {{ statusCounts.ready }}
        </span>
        <span class="w-px h-3 bg-[var(--p-content-border-color)]" />
        <span
          v-tooltip.bottom="t('live_order.status.done')"
          class="inline-flex items-center gap-1.5 text-[14px] font-medium text-[var(--p-text-muted-color)]"
        >
          <FontAwesomeIcon :icon="['far', 'circle-check']" class="text-[16px]" />
          {{ statusCounts.done }}
        </span>
      </div>

      <!-- 右側群組：顯示留言 switch + 結束收單（只在 hasAnySource 時顯示） -->
      <div v-if="hasAnySource" class="ml-auto flex items-center gap-3">
        <div class="flex items-center gap-2">
          <i class="pi pi-comments text-[var(--p-text-color)]" style="font-size:14px"></i>
          <span class="text-[14px] font-medium text-[var(--p-text-color)]">{{ t('live_order.label.show_comments') }}</span>
          <ToggleSwitch v-model="showComments" />
        </div>
        <!-- 結束收單：沒收單中商品 → disabled -->
        <span v-tooltip.bottom="hasLiveProduct ? '' : t('live_order.tooltip.no_live_product')">
          <button @click="confirmEndAllProducts" :disabled="!hasLiveProduct"
            :class="['border px-[11.5px] py-[8px] rounded-[6px] text-[14px] font-medium flex items-center gap-[7px]',
              hasLiveProduct
                ? 'bg-[var(--p-content-background)] border-[#ef4444] text-[#ef4444] hover:bg-[#fee2e2]'
                : 'bg-[var(--p-content-hover-background)] border-[var(--p-content-border-color)] text-[var(--p-text-muted-color)] cursor-not-allowed']">
            <i class="pi pi-power-off" style="font-size:14px"></i>{{ t('live_order.button.end_ordering') }}
          </button>
        </span>
      </div>
    </div>

    <!-- ── Body：空狀態 OR 收單操作頁 ───────────────── -->
    <template v-if="!hasAnySource">
      <div class="flex flex-1 min-h-0 gap-4">
        <div class="flex-1 flex flex-col self-stretch min-w-0 gap-4">
          <!-- 快速新增（與右側 panel 同高度起點） -->
          <QuickAddProductForm v-if="currentSession" @submit="onQuickAddProducts" />

          <div v-if="selectedProducts.length === 0" class="flex flex-col items-center justify-center gap-3 pt-12">
            <i class="pi pi-inbox text-5xl text-[var(--p-text-muted-color)]"></i>
            <p class="font-bold text-[18px] leading-normal text-[var(--p-text-color)]">{{ t('live_order.empty.no_product_content') }}</p>
            <p class="text-[14px] leading-normal text-[var(--p-text-muted-color)]">{{ t('live_order.empty.no_product_hint') }}</p>
          </div>
          <div v-else class="flex-1 overflow-y-auto">
            <div class="grid gap-2 justify-start" style="grid-template-columns: repeat(auto-fill, 240px)">
              <LiveProductCard
                v-for="p in selectedProducts"
                :key="p.id"
                :product="p"
                v-model:status="p.status"
                @delete="onDeleteProduct"
              />
            </div>
          </div>
        </div>

        <!-- 空狀態右側選擇收單來源（頂部對齊 QuickAdd） -->
        <div class="w-[340px] shrink-0 flex flex-col items-center gap-3 self-stretch pt-12">
          <i class="pi pi-inbox text-5xl text-[var(--p-text-muted-color)]"></i>
          <p class="font-bold text-[18px] leading-normal text-[var(--p-text-color)]">{{ t('live_order.empty.no_order_content') }}</p>
          <p class="text-[14px] leading-normal text-[var(--p-text-muted-color)]">{{ pickSourceHelperText }}</p>
          <span v-tooltip.bottom="pickSourceTooltip" class="mt-1">
            <button @click="onPickSource" :disabled="!canPickSource"
              :class="['border px-[13.25px] py-[9.75px] rounded-[6px] text-[15.75px] font-medium',
                canPickSource
                  ? 'bg-[var(--p-primary-color)] border-[var(--p-primary-color)] text-white hover:bg-[var(--p-primary-hover-color)]'
                  : 'bg-[var(--p-content-border-color)] border-[var(--p-content-border-color)] text-[var(--p-text-muted-color)] cursor-not-allowed']">
              {{ t('live_order.button.pick_source') }}
            </button>
          </span>
        </div>
      </div>
    </template>

    <template v-else>
      <OrderModeView
        :sources="sources"
        :products="selectedProducts"
        :show-comments="showComments"
        @pick-source="onPickSource"
        @remove-source="onRemoveSource"
        @delete-product="onDeleteProduct">
        <template #products-header>
          <QuickAddProductForm v-if="currentSession" @submit="onQuickAddProducts" />
        </template>
      </OrderModeView>
    </template>

    <LiveOrderSourceDialog v-model:visible="sourceDialogVisible"
      :used-post-ids="usedPostIds" :used-group-ids="usedGroupIds"
      @confirm="onSourceConfirmed" />
    <CreateSessionDialog v-model:visible="createDialogVisible" @create="onSessionCreate" />
    <AddProductDialog v-model:visible="addProductDialogVisible"
      :existing-products="selectedProducts" @add-products="onAddProducts" />
    <BatchEditDialog v-model:visible="batchEditDialogVisible"
      :products="selectedProducts" @apply="onBatchApply" @delete="onBatchDelete" />
    <GiftFormDialog v-model:visible="giftDialogVisible" @submit="onGiftSubmit" />
    <DuplicateProductDialog v-model:visible="duplicateDialogVisible" :names="duplicateNames" />

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import LiveOrderSourceDialog from './components/LiveOrderSourceDialog.vue'
import SessionSelector from './components/SessionSelector.vue'
import CreateSessionDialog from './components/CreateSessionDialog.vue'
import OrderModeView from './components/OrderModeView.vue'
import LiveProductCard from './components/LiveProductCard.vue'
import AddProductDialog from './components/AddProductDialog.vue'
import BatchEditDialog from './components/BatchEditDialog.vue'
import QuickAddProductForm from './components/QuickAddProductForm.vue'
import GiftFormDialog, { type GiftSubmitPayload } from './components/GiftFormDialog.vue'
import DuplicateProductDialog from './components/DuplicateProductDialog.vue'
import { isCatalogDuplicate } from './utils/productCatalog'
import type { MenuItem } from 'primevue/menuitem'

interface ProductSpec {
  id?: number
  name?: string
  stock?: number
  sold?: number
  price?: number
  [key: string]: unknown
}

interface LiveProduct {
  id: number
  name?: string
  keyword?: string
  sku?: string
  price?: number
  stock?: number
  status?: string
  startedAt?: number
  selectedSpecs?: ProductSpec[]
  specs?: ProductSpec[]
  [key: string]: unknown
}

interface LiveSource {
  id: number
  type: string
  label: string
  addedAt: Date
  postId?: number | string | null
  groupId?: number | string | null
}

interface LiveSession {
  id: number
  name: string
  date: string
  products: LiveProduct[]
  sources: LiveSource[]
}

interface SessionCreatePayload {
  name: string
  date: string
}

interface BatchApplyPayload {
  productIds: number[]
  patch: Record<string, unknown>
}

interface SourceConfirmExtras {
  postId?: number | string | null
  groupId?: number | string | null
}

const { t } = useI18n()
const confirm = useConfirm()
const toast = useToast()

const addProductDialogVisible = ref(false)
const giftDialogVisible = ref(false)

// SplitButton：主按鈕開選擇商品；下拉開禮物
interface MenuApi {
  toggle: (event: Event) => void
  show: (event: Event) => void
  hide: () => void
}
const addProductMenuRef = ref<MenuApi | null>(null)
const addProductMenuTriggerRef = ref<HTMLElement | null>(null)
const addProductMenuItems = computed<MenuItem[]>(() => [
  {
    label: t('live_order.button.send_gift'),
    icon: 'pi pi-gift',
    command: () => {
      giftDialogVisible.value = true
    },
  },
])
function openAddProductMenu(event: Event): void {
  addProductMenuRef.value?.toggle(event)
}

/**
 * 送禮物送出：把禮物加進當前場次商品列表，呈現為商品卡。
 *
 * `isGift: true` 旗標標記禮物來源，給商品卡渲染辨識。
 * 庫存扣減 / 入庫策略尚未規劃，暫時把 stock 直接設為發放數量，由後續實作決定是否扣除。
 */
function onGiftSubmit(payload: GiftSubmitPayload): void {
  if (!currentSession.value) return
  currentSession.value.products.push({
    id: Date.now(),
    name: payload.name,
    keyword: payload.keyword,
    price: 0,
    stock: payload.quantity,
    status: 'ready',
    specs: [],
    isGift: true,
    note: payload.message,
    imageUrl: payload.imageUrl,
  })
  toast.removeAllGroups();   toast.add({
    severity: 'success',
    summary: t('live_order.toast.gift_sent'),
    detail: payload.name,
    life: 2500,
  })
}
const batchEditDialogVisible = ref(false)
const showComments = ref(true)

/** Apply a batch-edit patch to selected products in the current session. */
function onBatchApply({ productIds, patch }: BatchApplyPayload): void {
  if (!currentSession.value) return
  const idSet = new Set(productIds)
  let updated = 0
  currentSession.value.products.forEach(p => {
    if (!idSet.has(p.id)) return
    Object.entries(patch).forEach(([key, value]) => { (p as Record<string, unknown>)[key] = value })
    updated++
  })
  toast.removeAllGroups();   toast.add({
    severity: 'success',
    summary: t('live_order.toast.batch_edit_done'),
    detail: t('live_order.toast.batch_edit_detail', { count: updated, fields: Object.keys(patch).length }),
    life: 2500,
  })
}

/** 批次刪除：依勾選 id 從當前場次的 products 移除，並 toast 提示。 */
function onBatchDelete(productIds: number[]): void {
  if (!currentSession.value || productIds.length === 0) return
  const idSet = new Set(productIds)
  const list = currentSession.value.products
  const before = list.length
  currentSession.value.products = list.filter(p => !idSet.has(p.id))
  const removed = before - currentSession.value.products.length
  if (removed > 0) {
    toast.removeAllGroups();     toast.add({
      severity: 'success',
      summary: t('live_order.toast.bulk_delete_done'),
      detail: t('live_order.toast.bulk_delete_detail', { count: removed }),
      life: 2500,
    })
  }
}

// ── 場次 ─────────────────────────────────────────
const sessions = ref<LiveSession[]>([
  { id: 1, name: '春季首播', date: '2025/05/13', products: [
    { id: 101, name: '草莓大福', sku: 'STRW-01', keyword: 'STRW', price: 120, stock: 50,
      specs: [{ id: 1, name: '原味', stock: 30, sold: 12 }, { id: 2, name: '大份', stock: 20, sold: 8 }] },
    { id: 102, name: '抹茶生乳捲蛋糕（季節限定）', sku: 'MTEA-02', keyword: 'MTEA', price: 280, stock: 30,
      specs: [{ id: 1, name: '原味', stock: 18, sold: 6 }, { id: 2, name: '抹茶加倍', stock: 12, sold: 4 }] },
    { id: 103, name: '限量小熊造型吊飾', sku: 'GIFT-01', keyword: 'BEAR', price: 0, stock: 20, isGift: true,
      note: '感謝大家支持，小熊送給你們！', specs: [] },
  ], sources: [] },
  { id: 2, name: '母親節特賣', date: '2025/05/10', products: [], sources: [] },
])
const currentSession = ref<LiveSession | null>(sessions.value[0])

function onSessionSelect(s: LiveSession): void { currentSession.value = s }

const createDialogVisible = ref(false)
/** Create a new session from the dialog payload and select it. */
function onSessionCreate(payload: SessionCreatePayload): void {
  const newSession: LiveSession = { id: Date.now(), ...payload, products: [], sources: [] }
  sessions.value.unshift(newSession)
  currentSession.value = newSession
  toast.removeAllGroups();   toast.add({ severity: 'success', summary: t('live_order.toast.session_created'), detail: newSession.name, life: 2500 })
}

// ── 商品（綁定到當前場次）─────────────────────────
const selectedProducts = computed<LiveProduct[]>(() => currentSession.value?.products ?? [])

interface QuickAddProductPayload {
  id: number
  name: string
  keyword: string
  price: number
  stock: number
  specs: never[]
}

// 重複商品提示彈窗
const duplicateDialogVisible = ref(false)
const duplicateNames = ref<string[]>([])

/**
 * 快速新增商品：把每筆都加入當前場次的 products 清單；
 * 原型階段不做重複名稱檢查、不彈重複 dialog，只顯示一個成功 toast。
 */
function onQuickAddProducts(payloads: QuickAddProductPayload[]): void {
  if (!currentSession.value || payloads.length === 0) return
  payloads.forEach((p) => {
    currentSession.value!.products.push({
      id: p.id,
      name: p.name,
      keyword: p.keyword,
      price: p.price,
      stock: p.stock,
      status: 'ready',
      specs: [],
    })
  })
  toast.removeAllGroups()
  toast.add({
    severity: 'success',
    summary: t('live_order.toast.products_added'),
    detail: t('live_order.toast.products_added_detail', { added: payloads.length }),
    life: 2000,
  })
}

/** Remove a product card from the current session. */
function onDeleteProduct(id: number): void {
  if (!currentSession.value) return
  const list = currentSession.value.products
  const idx = list.findIndex((p) => p.id === id)
  if (idx === -1) return
  list.splice(idx, 1)
}

/** Merge newly added products into the current session, skipping duplicates. */
function onAddProducts(products: LiveProduct[]): void {
  if (!currentSession.value) return
  const target = currentSession.value.products
  const ids = new Set(target.map(p => p.id))
  let added = 0
  products.forEach(p => {
    if (!ids.has(p.id)) {
      target.push({ ...p, status: p.status || 'ready' })
      added++
    }
  })
  const skipped = products.length - added
  toast.removeAllGroups();   toast.add({
    severity: added > 0 ? 'success' : 'warn',
    summary: added > 0 ? t('live_order.toast.products_added') : t('live_order.toast.products_not_added'),
    detail: skipped > 0
      ? t('live_order.toast.products_added_with_skipped', { added, skipped })
      : t('live_order.toast.products_added_detail', { added }),
    life: 2500,
  })
}

// ── 收單來源（多筆，綁定到當前場次） ─────────────
const sourceDialogVisible = ref(false)
const sources = computed<LiveSource[]>(() => currentSession.value?.sources ?? [])

const hasAnySource = computed(() => sources.value.length > 0)

const hasLiveProduct = computed(() => selectedProducts.value.some(p => p.status === 'live'))

// 各狀態的商品數，給工具列上的小型統計顯示用
const statusCounts = computed(() => ({
  live: selectedProducts.value.filter(p => p.status === 'live').length,
  ready: selectedProducts.value.filter(p => p.status === 'ready' || !p.status).length,
  done: selectedProducts.value.filter(p => p.status === 'done').length,
}))

const canPickSource = computed(() =>
  Boolean(currentSession.value) && selectedProducts.value.length > 0)

const pickSourceTooltip = computed(() => {
  if (!currentSession.value) return t('live_order.tooltip.pick_or_create_session')
  if (selectedProducts.value.length === 0) return t('live_order.tooltip.add_product_first')
  return ''
})

const pickSourceHelperText = computed(() => {
  if (!currentSession.value) return t('live_order.tooltip.pick_or_create_session')
  if (selectedProducts.value.length === 0) return t('live_order.empty.pick_source_after_adding')
  return t('live_order.empty.click_button_below_to_pick_source')
})

function onPickSource(): void {
  if (!canPickSource.value) return
  sourceDialogVisible.value = true
}

/** Map a confirmed source type/extras to a LiveSource entry on the current session. */
function onSourceConfirmed(type: string, extras: SourceConfirmExtras = {}): void {
  if (!currentSession.value) return
  const labelKeyMap: Record<string, string> = {
    fb: 'live_order.source_type_label.fb',
    ig: 'live_order.source_type_label.ig',
    group: 'live_order.source_type_label.group',
    live: 'live_order.source_type_label.live',
  }
  const labelKey = labelKeyMap[type]
  if (!labelKey) return
  const label = t(labelKey)
  currentSession.value.sources.push({
    id: Date.now() + Math.random(),
    type,
    label,
    addedAt: new Date(),
    postId:  extras.postId  ?? null,
    groupId: extras.groupId ?? null,
  })
  toast.removeAllGroups();   toast.add({
    severity: 'success',
    summary: t('live_order.toast.source_added'),
    detail: label,
    life: 2500,
  })
}

// 當前場次已使用的貼文 / 社團 id 清單（傳入 dialog 用於 disable）
const usedPostIds = computed(() =>
  (currentSession.value?.sources ?? [])
    .filter(s => (s.type === 'fb' || s.type === 'ig') && s.postId != null)
    .map(s => s.postId as number | string)
)
const usedGroupIds = computed(() =>
  (currentSession.value?.sources ?? [])
    .filter(s => s.type === 'group' && s.groupId != null)
    .map(s => s.groupId as number | string)
)

function onRemoveSource(id: number | string): void {
  const target = sources.value.find(s => s.id === id)
  if (!target) return
  confirm.require({
    message: t('live_order.dialog.remove_source_message', { label: target.label }),
    header: t('live_order.dialog.remove_source_header'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('live_order.button.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('live_order.dialog.remove'), severity: 'danger' },
    accept: () => {
      if (!currentSession.value) return
      const arr = currentSession.value.sources
      const idx = arr.findIndex(s => s.id === id)
      if (idx !== -1) arr.splice(idx, 1)
      toast.removeAllGroups();       toast.add({ severity: 'info', summary: t('live_order.toast.source_removed'), detail: target.label, life: 2000 })
    },
  })
}

// ── 結束收單：所有商品變 done，來源保留 ─────────────
function confirmEndAllProducts(): void {
  if (!hasLiveProduct.value) return
  const liveCount = selectedProducts.value.filter(p => p.status === 'live').length
  confirm.require({
    message: t('live_order.dialog.end_ordering_message', { count: liveCount }),
    header: t('live_order.dialog.end_ordering_header'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('live_order.button.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('live_order.button.end_ordering'), severity: 'danger' },
    accept: () => endAllProducts(),
  })
}

function endAllProducts(): void {
  let changed = 0
  selectedProducts.value.forEach(p => {
    if (p.status === 'live') { p.status = 'done'; changed++ }
  })
  toast.removeAllGroups();   toast.add({
    severity: 'success',
    summary: t('live_order.toast.ordering_ended'),
    detail: t('live_order.toast.ordering_ended_detail', { count: changed }),
    life: 2500,
  })
}

// ── 計時器：以當前場次最早「開始收單」的商品為起點 ─────
// 商品狀態變為 live 時自動記錄 startedAt（首次記錄後保留，允許 undo 接續）
watch(
  () => selectedProducts.value.map(p => ({ id: p.id, status: p.status })),
  () => {
    selectedProducts.value.forEach(p => {
      if (p.status === 'live' && !p.startedAt) p.startedAt = Date.now()
    })
  },
  { deep: true, immediate: true }
)

const startedAt = computed<number | null>(() => {
  const live = selectedProducts.value.filter((p): p is LiveProduct & { startedAt: number } => p.status === 'live' && typeof p.startedAt === 'number')
  if (live.length === 0) return null
  return Math.min(...live.map(p => p.startedAt))
})
const now = ref(Date.now())
let timerId: ReturnType<typeof setInterval> | null = null

const elapsedDisplay = computed(() => {
  if (!startedAt.value) return '00:00:00'
  const sec = Math.max(0, Math.floor((now.value - startedAt.value) / 1000))
  const h = String(Math.floor(sec / 3600)).padStart(2, '0')
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
})

watch(hasLiveProduct, (yes) => {
  if (yes) {
    now.value = Date.now()
    if (!timerId) timerId = setInterval(() => { now.value = Date.now() }, 1000)
  } else {
    if (timerId) { clearInterval(timerId); timerId = null }
  }
}, { immediate: true })

onUnmounted(() => { if (timerId) clearInterval(timerId) })
</script>
