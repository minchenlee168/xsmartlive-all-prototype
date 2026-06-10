<template>
  <!-- 留言卡：6 種變體（Default / 黑名單 / VIP / 官方小編 × FB/IG/直播） -->
  <div :class="[
    'rounded-[8px] border px-2.5 py-2 flex gap-2 items-start shadow-sm',
    isPinned ? 'bg-[var(--p-primary-50)] border-[var(--p-primary-400)]' : 'bg-[var(--p-content-background)] border-[var(--p-content-border-color)]',
  ]">

    <!-- 左：頭像 + 底部標籤 -->
    <div class="flex flex-col items-center gap-1 shrink-0" style="width:48px">
      <!-- Avatar -->
      <div v-if="isBlacklist" class="w-[40px] h-[40px] rounded-full bg-[var(--p-text-color)] flex items-center justify-center">
        <i class="pi pi-lock text-white" style="font-size:16px"></i>
      </div>
      <div v-else class="w-[40px] h-[40px] rounded-full bg-[var(--p-content-border-color)] flex items-center justify-center">
        <i class="pi pi-user text-[var(--p-text-muted-color)]" style="font-size:18px"></i>
      </div>
      <!-- Badge -->
      <div v-if="comment.tagType === 'official'"
        class="bg-[var(--p-primary-color)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 leading-none whitespace-nowrap">
        <i class="pi pi-check-circle" style="font-size:8px"></i>{{ t('live_order.label.official_editor') }}
      </div>
      <span v-else-if="isBlacklist" class="bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">{{ t('live_order.label.blacklist') }}</span>
      <span v-else-if="comment.tagType === 'vip'" class="bg-[#fbbf24] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">{{ t('live_order.label.vip') }}</span>
      <div v-else-if="comment.stars" class="flex gap-0">
        <i v-for="i in 5" :key="i" :class="['pi', i <= comment.stars ? 'pi-star-fill text-[#fbbf24]' : 'pi-star text-[var(--p-content-border-color)]']" style="font-size:8px"></i>
      </div>
    </div>

    <!-- 中：名字 + 留言 -->
    <div class="flex-1 min-w-0 flex flex-col gap-0.5">
      <div class="flex items-center gap-1">
        <span class="text-[14px] font-bold text-[var(--p-text-color)] truncate">{{ comment.user }}</span>
      </div>
      <div class="flex items-center gap-1">
        <!-- 綠色實心圓 + 白勾：留言含「+N」或追加訂單成功時顯示（下單成功標示） -->
        <span v-if="hasOrdered"
          class="w-[14px] h-[14px] rounded-full bg-[#22c55e] flex items-center justify-center shrink-0">
          <i class="pi pi-check text-white" style="font-size:8px"></i>
        </span>
        <p class="text-[13px] text-[var(--p-text-color)] break-words leading-tight">{{ comment.text }}</p>
      </div>
    </div>

    <!-- 右：動作 icons + 平台 + 時間 -->
    <div class="flex flex-col items-end gap-1 shrink-0 h-full">
      <!-- 動作 icons：pinned/官方小編 不顯示 -->
      <div v-if="!isPinned" class="flex gap-1.5">
        <button @click="onLockClick" class="text-[var(--p-text-muted-color)] hover:text-[var(--p-text-color)]"
          v-tooltip.top="isBlacklist ? t('live_order.tooltip.remove_from_blacklist') : t('live_order.tooltip.add_to_blacklist')">
          <i :class="isBlacklist ? 'pi pi-lock-open' : 'pi pi-lock'" style="font-size:13px"></i>
        </button>
        <button @click="onActionClick" class="text-[var(--p-text-muted-color)] hover:text-[var(--p-text-color)]"
          v-tooltip.top="hasOrdered ? t('live_order.tooltip.order_detail') : t('live_order.tooltip.add_order')">
          <i :class="hasOrdered ? 'pi pi-search' : 'pi pi-plus'" style="font-size:13px"></i>
        </button>
      </div>
      <div class="flex items-center gap-1 mt-auto">
        <i :class="platformMeta.platformIcon" :style="`font-size:10px; color:${platformMeta.platformColor}`"></i>
        <span class="text-[10px] text-[var(--p-text-muted-color)] whitespace-nowrap">{{ comment.time }}</span>
      </div>
    </div>

    <!-- 訂單明細 Dialog -->
    <OrderDetailDialog
      v-model:visible="detailVisible"
      :comment="comment"
      :product="orderMatch?.product ?? undefined"
      :quantity="orderMatch?.quantity"
      :platform-meta="platformMeta" />
    <!-- 追加訂單 Dialog：挑選收單中的商品 -->
    <AddOrderDialog v-model:visible="addOrderVisible" :products="liveProducts" :user="comment.user" @submit="onAddOrderSubmit" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import OrderDetailDialog from './OrderDetailDialog.vue'
import AddOrderDialog, { type AddOrderPayload } from './AddOrderDialog.vue'

interface LiveComment {
  id: number | string
  user?: string
  text?: string
  time?: string
  tagType?: string
  pinned?: boolean
  stars?: number
  platform?: string
  [key: string]: unknown
}

interface PlatformMeta {
  platformIcon: string
  platformColor: string
}

interface LiveProductLike {
  id: number
  name?: string
  keyword?: string
  sku?: string
  price?: number
  [key: string]: unknown
}

interface Props {
  comment: LiveComment
  platformMeta: PlatformMeta
  /** 目前收單中（status==='live'）的商品，供「追加訂單」挑選 */
  liveProducts?: LiveProductLike[]
}
const props = withDefaults(defineProps<Props>(), {
  liveProducts: () => [],
})

const emit = defineEmits<{
  blacklist: [id: number | string]
  unblacklist: [id: number | string]
}>()
const { t } = useI18n()
const confirm = useConfirm()
const toast = useToast()

const isPinned    = computed(() => !!props.comment.pinned || props.comment.tagType === 'official')
const isBlacklist = computed(() => props.comment.tagType === 'blacklist')
const hasPlusOne  = computed(() => !isBlacklist.value && /\+\d+/.test(props.comment.text || ''))
/** 透過「追加訂單」成功送出後標記為已下單（留言文字本身沒有「+N」） */
const manuallyOrdered = ref(false)
/** 已成功下標：留言含「+N」或追加訂單成功，且未被黑名單；否則顯示「追加訂單」入口 */
const hasOrdered  = computed(() => hasPlusOne.value || (!isBlacklist.value && manuallyOrdered.value))

/**
 * 解析留言中的「{關鍵字}+{數量}」並配對到收單中的商品卡。
 * 關鍵字對應商品的 `keyword`（或 sku 前綴）；數量取自「+N」。
 */
const orderMatch = computed(() => {
  const m = (props.comment.text || '').match(/([A-Za-z0-9]+)\+(\d+)/)
  if (!m) return null
  const keyword = m[1]
  const quantity = Number(m[2])
  const product = props.liveProducts.find(p =>
    (p.keyword && p.keyword === keyword) || (p.sku && p.sku.split('-')[0] === keyword),
  ) ?? null
  return { keyword, quantity, product }
})

const detailVisible = ref(false)
const addOrderVisible = ref(false)

/** Prompt the user, then emit blacklist/unblacklist for this comment. */
function onLockClick(): void {
  if (isBlacklist.value) {
    confirm.require({
      message: t('live_order.dialog.unblacklist_message', { user: props.comment.user ?? '' }),
      header: t('live_order.dialog.unblacklist_header'),
      icon: 'pi pi-exclamation-triangle',
      rejectProps: { label: t('live_order.button.cancel'), severity: 'secondary', outlined: true },
      acceptProps: { label: t('live_order.dialog.unblacklist'), severity: 'warn' },
      accept: () => emit('unblacklist', props.comment.id),
    })
  } else {
    confirm.require({
      message: t('live_order.dialog.blacklist_message', { user: props.comment.user ?? '' }),
      header: t('live_order.dialog.blacklist_header'),
      icon: 'pi pi-exclamation-triangle',
      rejectProps: { label: t('live_order.button.cancel'), severity: 'secondary', outlined: true },
      acceptProps: { label: t('live_order.dialog.blacklist'), severity: 'danger' },
      accept: () => emit('blacklist', props.comment.id),
    })
  }
}

/** 已下單 → 開訂單明細；未下單 → 開追加訂單（挑收單中商品）。 */
function onActionClick(): void {
  if (hasOrdered.value) detailVisible.value = true
  else addOrderVisible.value = true
}

/** 追加訂單送出：mock 以 toast 回饋（實際串接時改為寫入訂單）。 */
function onAddOrderSubmit(payload: AddOrderPayload): void {
  manuallyOrdered.value = true
  toast.add({
    severity: 'success',
    summary: t('live_order.toast.order_added'),
    detail: t('live_order.toast.order_added_detail', {
      user: props.comment.user ?? '',
      count: payload.items.length,
    }),
    life: 2500,
  })
}
</script>
