<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * 追加訂單 dialog：從留言卡觸發，列出「收單中（status==='live'）」的商品，
 * 讓使用者替該留言者多選商品補訂單。mock-only，不串接真實下單。
 *
 * 列表排列：checkbox + 商品縮圖 + 名稱 +「關鍵字：xxx」副標 + 狀態 badge。
 */

interface LiveProductLike {
  id: number
  name?: string
  keyword?: string
  sku?: string
  price?: number
  status?: string
  imageUrl?: string
  [key: string]: unknown
}

export interface AddOrderItem {
  productId: number
  qty: number
}

export interface AddOrderPayload {
  items: AddOrderItem[]
}

interface Props {
  visible?: boolean
  /** 收單中的商品清單 */
  products?: LiveProductLike[]
  /** 留言者名稱，顯示於標題 */
  user?: string
}
const props = withDefaults(defineProps<Props>(), {
  visible: false,
  products: () => [],
  user: '',
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [payload: AddOrderPayload]
}>()

const { t } = useI18n()

const innerVisible = ref(props.visible)
const selectedIds = ref<number[]>([])
/** 每個被勾選商品的數量（key 為 productId）。 */
const qtys = ref<Record<number, number>>({})

watch(
  () => props.visible,
  (v) => {
    innerVisible.value = v
    if (v) {
      selectedIds.value = []
      qtys.value = {}
    }
  },
)

/** 顯示用關鍵字：優先 keyword，否則取 sku 前綴。 */
function keywordOf(p: LiveProductLike): string {
  return p.keyword || (p.sku || '').split('-')[0] || `P${p.id}`
}

function isSelected(id: number): boolean {
  return selectedIds.value.includes(id)
}

function toggle(id: number): void {
  if (isSelected(id)) {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
    delete qtys.value[id]
  } else {
    selectedIds.value = [...selectedIds.value, id]
    qtys.value[id] = 1
  }
}

/** 調整某商品數量（最小 1）。 */
function adjustQty(id: number, delta: number): void {
  qtys.value[id] = Math.max(1, (Number(qtys.value[id]) || 1) + delta)
}

const selectedCount = computed(() => selectedIds.value.length)
const canSubmit = computed(() => selectedCount.value > 0)

interface StatusBadge {
  label: string
  cls: string
}
/** 狀態 badge：收單中(紅) / 準備中(灰) / 已結束(灰)；對齊商品卡狀態色。 */
function statusBadge(p: LiveProductLike): StatusBadge | null {
  switch (p.status) {
    case 'live': return { label: t('live_order.label.live'), cls: 'bg-[#fee2e2] text-[#dc2626]' }
    case 'ready': return { label: t('live_order.label.ready'), cls: 'bg-[var(--p-content-hover-background)] text-[var(--p-text-muted-color)]' }
    case 'done': return { label: t('live_order.label.done'), cls: 'bg-[var(--p-content-hover-background)] text-[var(--p-text-muted-color)]' }
    default: return null
  }
}

function close(): void {
  innerVisible.value = false
  emit('update:visible', false)
}

function onSubmit(): void {
  if (!canSubmit.value) return
  const items = selectedIds.value.map(id => ({
    productId: id,
    qty: Math.max(1, Number(qtys.value[id]) || 1),
  }))
  emit('submit', { items })
  close()
}
</script>

<template>
  <Dialog
    v-model:visible="innerVisible"
    modal
    :draggable="false"
    :style="{ width: '560px' }"
    :pt="{
      header: { style: 'padding: 17.5px' },
      content: { style: 'padding: 0 17.5px 17.5px' },
      footer: { style: 'padding: 0 17.5px 17.5px' },
    }"
    @update:visible="(v) => emit('update:visible', v)"
  >
    <template #header>
      <span class="font-semibold text-[var(--p-text-color)] flex items-center gap-2" style="font-size: 17.5px">
        <i class="pi pi-plus-circle text-[var(--p-primary-color)]" style="font-size: 18px"></i>
        {{ t('live_order.dialog.add_order_header') }}
        <span v-if="user" class="text-[14px] font-normal text-[var(--p-text-muted-color)]">— {{ user }}</span>
      </span>
    </template>

    <div class="flex flex-col gap-3 pt-2">
      <label class="text-[14px] font-medium text-[var(--p-text-color)]">
        {{ t('live_order.label.pick_live_product') }}
      </label>

      <div v-if="products.length === 0" class="py-6 text-center text-[14px] text-[var(--p-text-muted-color)]">
        {{ t('live_order.empty.no_live_product') }}
      </div>

      <div v-else class="flex flex-col max-h-[320px] overflow-y-auto pr-1 divide-y divide-[var(--p-content-border-color)]">
        <button
          v-for="p in products"
          :key="p.id"
          type="button"
          class="flex items-center gap-3 px-2 py-2.5 text-left hover:bg-[var(--p-content-hover-background)]"
          @click="toggle(p.id)"
        >
          <!-- Checkbox -->
          <span
            class="shrink-0 w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center"
            :class="isSelected(p.id)
              ? 'bg-[var(--p-primary-color)] border-[var(--p-primary-color)]'
              : 'border-[var(--p-content-border-color)] bg-[var(--p-content-background)]'"
          >
            <i v-if="isSelected(p.id)" class="pi pi-check text-white" style="font-size: 11px"></i>
          </span>

          <!-- 縮圖 -->
          <img
            v-if="p.imageUrl"
            :src="p.imageUrl"
            alt=""
            class="shrink-0 w-[36px] h-[36px] rounded-[6px] object-cover border border-[var(--p-content-border-color)]"
          />
          <div
            v-else
            class="shrink-0 w-[36px] h-[36px] rounded-[6px] border border-dashed border-[var(--p-content-border-color)] bg-[var(--p-content-hover-background)] flex items-center justify-center"
          >
            <i class="pi pi-image text-[var(--p-text-muted-color)]" style="font-size: 14px"></i>
          </div>

          <!-- 名稱 + 關鍵字 -->
          <div class="flex-1 min-w-0">
            <div class="font-bold text-[14px] text-[var(--p-text-color)] truncate">{{ p.name }}</div>
            <div class="text-[12px] text-[var(--p-text-muted-color)] truncate">
              {{ t('live_order.label.keyword_with_value', { value: keywordOf(p) }) }}
            </div>
          </div>

          <!-- 數量 stepper：勾選後顯示 -->
          <div v-if="isSelected(p.id)" class="flex items-center shrink-0" @click.stop>
            <button
              type="button"
              class="w-[24px] h-[26px] border border-[var(--p-content-border-color)] border-r-0 rounded-l-[6px] flex items-center justify-center hover:bg-[var(--p-content-hover-background)]"
              @click="adjustQty(p.id, -1)"
            >
              <i class="pi pi-minus text-[var(--p-text-muted-color)]" style="font-size: 10px"></i>
            </button>
            <input
              v-model.number="qtys[p.id]"
              type="number"
              min="1"
              class="w-[44px] h-[26px] border border-[var(--p-content-border-color)] text-center text-[14px] text-[var(--p-text-color)] outline-none focus:border-[var(--p-primary-color)]"
            />
            <button
              type="button"
              class="w-[24px] h-[26px] border border-[var(--p-content-border-color)] border-l-0 rounded-r-[6px] flex items-center justify-center hover:bg-[var(--p-content-hover-background)]"
              @click="adjustQty(p.id, 1)"
            >
              <i class="pi pi-plus text-[var(--p-text-muted-color)]" style="font-size: 10px"></i>
            </button>
          </div>

          <!-- 狀態 badge -->
          <span
            v-if="statusBadge(p)"
            class="shrink-0 text-[12.25px] font-bold px-[7px] py-[3.5px] rounded-[12px] leading-none"
            :class="statusBadge(p)!.cls"
          >
            {{ statusBadge(p)!.label }}
          </span>
        </button>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button
          :label="t('live_order.button.cancel')"
          severity="secondary"
          variant="outlined"
          @click="close"
        />
        <Button
          :label="t('live_order.button.submit_order_count', { count: selectedCount })"
          icon="pi pi-check"
          :disabled="!canSubmit"
          @click="onSubmit"
        />
      </div>
    </template>
  </Dialog>
</template>
