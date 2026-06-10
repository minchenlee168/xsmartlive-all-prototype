<template>
  <Dialog
    :visible="visible"
    modal
    :draggable="false"
    :dismissable-mask="true"
    :style="{ width: '420px' }"
    :pt="{
      header: { style: 'padding: 18px 20px' },
      content: { style: 'padding: 0' },
      footer: { style: 'padding: 16px 20px' },
    }"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="flex items-baseline gap-2">
        <span class="font-semibold text-[var(--p-text-color)]" style="font-size: 17.5px">
          {{ t('live_order.dialog.order_detail_header') }}
        </span>
        <span class="text-[14px] text-[var(--p-text-muted-color)]">#{{ detail.orderNo }}</span>
      </div>
    </template>

    <!-- 商品區 -->
    <div class="flex flex-col items-center gap-2 px-5 pt-2 pb-6">
      <div class="w-[72px] h-[72px] rounded-[14px] bg-[var(--p-primary-50)] flex items-center justify-center mb-1">
        <i class="pi pi-shopping-bag text-[var(--p-primary-color)]" style="font-size: 28px"></i>
      </div>
      <div class="text-[18px] font-bold text-[var(--p-text-color)] text-center">{{ detail.productName }}</div>
      <div v-if="detail.variant" class="text-[13px] text-[var(--p-text-muted-color)] text-center">{{ detail.variant }}</div>
      <div class="flex items-baseline gap-1 mt-1">
        <span class="text-[14px] text-[var(--p-text-muted-color)]">{{ t('live_order.label.currency_ntd') }}</span>
        <span class="text-[30px] font-bold text-[var(--p-primary-color)] leading-none">{{ detail.amount.toLocaleString() }}</span>
      </div>
      <div class="text-[12px] text-[var(--p-text-muted-color)]">
        {{ t('live_order.label.unit_price') }} {{ detail.unitPrice.toLocaleString() }} ·
        {{ t('live_order.table.column.qty') }} {{ detail.qty }}
      </div>
      <Tag severity="warn" rounded class="mt-2">
        <span class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
          {{ t('live_order.table.value.checkout_unpaid') }}
        </span>
      </Tag>
    </div>

    <Divider class="!m-0" />

    <!-- 訂單 meta 區 -->
    <div class="flex flex-col gap-4 px-5 py-5">
      <div class="flex items-center justify-between">
        <span class="text-[13px] text-[var(--p-text-muted-color)]">{{ t('live_order.table.column.created_at') }}</span>
        <span class="text-[13px] text-[var(--p-text-color)]">
          {{ detail.createdAt }}<template v-if="detail.daysAgo !== null"> · {{ t('live_order.text.days_ago', { n: detail.daysAgo }) }}</template>
        </span>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0">
          <Avatar :label="detail.initial" shape="circle" class="!bg-[var(--p-primary-color)] !text-white shrink-0" />
          <div class="flex flex-col min-w-0">
            <span class="text-[15px] font-semibold text-[var(--p-text-color)] truncate">{{ detail.memberName }}</span>
            <span class="text-[12px] text-[var(--p-text-muted-color)]">
              {{ detail.isVip ? t('live_order.label.vip_member') : t('live_order.label.regular_member') }}
            </span>
          </div>
        </div>
        <Button
          :label="t('live_order.button.view_member')"
          icon="pi pi-angle-right"
          icon-pos="right"
          variant="link"
          class="!px-0 shrink-0"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <div class="flex items-center gap-2">
          <i class="pi pi-comment text-[var(--p-text-muted-color)]" style="font-size: 14px"></i>
          <Chip
            :label="detail.keyword"
            :pt="{
              root: { class: 'bg-[var(--p-primary-50)] py-1 px-3' },
              label: { class: 'text-[var(--p-primary-color)] font-medium text-[13px]' },
            }"
          />
        </div>
        <span class="text-[12px] text-[var(--p-text-muted-color)] pl-6">{{ t('live_order.text.keyword_auto_order') }}</span>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between w-full">
        <Button
          :label="t('live_order.button.remove_order')"
          icon="pi pi-ban"
          variant="text"
          severity="danger"
          class="!px-0"
          @click="onRemove"
        />
        <Button
          :label="t('live_order.button.close')"
          severity="secondary"
          outlined
          @click="onVisibleChange(false)"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface LiveComment {
  id?: number | string
  user?: string
  text?: string
  time?: string
  tagType?: string
  platform?: string
  [key: string]: unknown
}

interface PlatformMeta {
  platformIcon: string
  platformColor: string
}

interface OrderedProduct {
  id?: number
  name?: string
  price?: number
  keyword?: string
  sku?: string
  specs?: Array<{ name?: string; [key: string]: unknown }>
  [key: string]: unknown
}

interface Props {
  visible?: boolean
  comment: LiveComment
  /** 配對到的收單中商品卡；有值時優先顯示其名稱/售價/規格 */
  product?: OrderedProduct
  /** 下單數量（取自留言「+N」） */
  quantity?: number
  /** 保留以相容呼叫端；本卡片不再顯示平台圖示 */
  platformMeta?: PlatformMeta
}
const props = withDefaults(defineProps<Props>(), {
  visible: false,
  product: undefined,
  quantity: undefined,
  platformMeta: undefined,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  remove: []
}>()

/** Forward Dialog visibility changes to the parent. */
function onVisibleChange(v: boolean): void { emit('update:visible', v) }

function onRemove(): void {
  emit('remove')
  onVisibleChange(false)
}

// 商品名稱 / 規格目前資料來源未提供，依留言 seed 取一組 mock 讓卡片呈現完整（與單價 mock 同做法）
const MOCK_PRODUCTS = ['經典白色T恤（直播卡）', '日系棉麻襯衫', '機能防風外套', '韓版針織毛衣', '純棉圓領上衣']
const MOCK_VARIANTS = ['白色T恤 · 白色 / S', '卡其 / M', '黑色 / L', '米白 / F', '深藍 / XL']

/**
 * 把留言整理成單筆訂單卡片要顯示的資料。
 * 商品名/規格/單價/數量為 mock（資料層尚未提供）；
 * 會員、關鍵字、建立時間取自留言。
 */
const detail = computed(() => {
  const c = props.comment
  const p = props.product
  const idNum = typeof c.id === 'number' ? c.id : Number(c.id) || 0
  const seedSource = `${c.id ?? ''}${c.text ?? ''}` || 'x'
  const seed = seedSource.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)

  // 數量：優先用傳入值，其次解析留言「+N」，最後 fallback 1
  const parsedQty = Number((c.text ?? '').match(/\+(\d+)/)?.[1])
  const qty = props.quantity ?? (Number.isFinite(parsedQty) ? parsedQty : 1)

  // 商品：優先用配對到的收單中商品卡，否則用 mock fallback
  const unitPrice = p?.price ?? (200 + (seed % 12) * 100)
  const productName = p?.name ?? MOCK_PRODUCTS[seed % MOCK_PRODUCTS.length]
  const specVariant = (p?.specs ?? []).map(s => s?.name).filter(Boolean).join(' / ')
  const variant = p ? specVariant : MOCK_VARIANTS[seed % MOCK_VARIANTS.length]
  const user = c.user ?? ''

  return {
    orderNo: `A${String(idNum || (seed % 999) + 1).padStart(3, '0')}`,
    productName,
    variant,
    unitPrice,
    qty,
    amount: unitPrice * qty,
    keyword: c.text ?? '',
    memberName: user,
    initial: user.trim().charAt(0).toUpperCase() || '?',
    isVip: c.tagType === 'vip',
    createdAt: c.time ?? '',
    daysAgo: daysAgoFrom(c.time),
  }
})

/** 由建立時間字串計算距今天數；無法解析時回傳 null。 */
function daysAgoFrom(time?: string): number | null {
  if (!time) return null
  const then = new Date(time.replace(' ', 'T')).getTime()
  if (Number.isNaN(then)) return null
  const diff = Math.floor((Date.now() - then) / 86_400_000)
  return diff >= 0 ? diff : null
}
</script>
