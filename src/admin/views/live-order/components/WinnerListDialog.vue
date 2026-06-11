<template>
  <Dialog
    v-model:visible="innerVisible"
    modal :draggable="false"
    :style="{ width: '1100px' }"
    :pt="{
      header:  { style: 'padding: 17.5px' },
      content: { style: 'padding: 0 17.5px 17.5px' },
    }"
    @update:visible="v => emit('update:visible', v)">

    <template #header>
      <span class="font-semibold text-[var(--p-text-color)]" style="font-size:17.5px">{{ t('live_order.dialog.winner_list_header') }}</span>
    </template>

    <div class="flex flex-col gap-4">
      <DataTable
        :value="visibleOrders"
        :striped-rows="true"
        class="w-full"
        :pt="{
          column: {
            headerCell: { style: 'white-space: nowrap;' },
          },
        }"
      >
        <Column field="orderNo" :header="t('live_order.table.column.order_no')">
          <template #body="{ data }"><span class="text-[16px] text-[var(--p-text-color)]">{{ data.orderNo }}</span></template>
        </Column>
        <Column field="member" :header="t('live_order.table.column.member')">
          <template #body="{ data }"><span class="text-[16px] text-[var(--p-text-color)]">{{ data.member }}</span></template>
        </Column>
        <Column field="spec" :header="t('live_order.table.column.product_spec')">
          <template #body="{ data }"><span class="text-[16px] text-[var(--p-text-color)]">{{ data.spec }}</span></template>
        </Column>
        <Column field="qty" :header="t('live_order.table.column.qty')">
          <template #body="{ data }"><span class="text-[16px] text-[var(--p-text-color)]">{{ data.qty }}</span></template>
        </Column>
        <Column field="paid" :header="t('live_order.table.column.checkout_status')">
          <template #body="{ data }">
            <span
              class="inline-flex items-center px-[7px] py-[3.5px] rounded-[12px] text-[12.25px] font-bold leading-none"
              :class="data.paid ? 'checkout-paid' : 'checkout-unpaid'">
              {{ data.paid ? t('live_order.table.value.checkout_paid') : t('live_order.table.value.checkout_unpaid') }}
            </span>
          </template>
        </Column>
        <Column field="createdAt" :header="t('live_order.table.column.created_at')">
          <template #body="{ data }"><span class="text-[16px] text-[var(--p-text-color)]">{{ data.createdAt }}</span></template>
        </Column>
        <Column :header="t('live_order.table.column.actions')">
          <template #body="{ data }">
            <div class="flex items-center gap-2">
              <button
                v-tooltip.top="t('live_order.tooltip.order_detail')"
                class="w-[32px] h-[32px] rounded-[6px] flex items-center justify-center text-[var(--p-primary-color)] hover:bg-[var(--p-primary-50)]"
                @click="openDetail(data)"
              >
                <i class="pi pi-search" style="font-size: 14px"></i>
              </button>
              <button
                v-tooltip.top="t('live_order.button.remove_order')"
                class="w-[32px] h-[32px] rounded-[6px] flex items-center justify-center text-[#ef4444] hover:bg-[#fee2e2]"
                @click="removeOrder(data.orderNo)"
              >
                <FontAwesomeIcon :icon="['far', 'trash']" class="text-[14px]" />
              </button>
            </div>
          </template>
        </Column>

        <template #empty>
          <div class="py-6 text-center text-[16px] text-[var(--p-text-muted-color)]">{{ t('live_order.empty.no_order') }}</div>
        </template>
      </DataTable>

      <div class="flex justify-end items-center">
        <span class="text-[14px] text-[var(--p-text-color)] leading-[21px]">{{ t('live_order.label.subtotal') }}</span>
        <span class="text-[16px] font-medium text-[var(--p-text-color)]">：</span>
        <span class="text-[14px] font-bold text-[#f97316]">${{ subtotal.toLocaleString() }}</span>
      </div>
    </div>

    <!-- 訂單明細 Dialog：點得標清單列「訂單明細」開啟 -->
    <OrderDetailDialog
      v-model:visible="detailVisible"
      :comment="detailComment"
      :items="detailItems"
      @remove="removeOrder(detailOrder?.orderNo)"
    />
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import OrderDetailDialog from './OrderDetailDialog.vue'

const { t } = useI18n()

interface ProductSpec {
  name?: string
  stock?: number
  sold?: number
  price?: number
  [key: string]: unknown
}

interface ProductLike {
  id?: number
  name?: string
  sku?: string
  price?: number
  isGift?: boolean
  specs?: ProductSpec[]
  selectedSpecs?: ProductSpec[]
  [key: string]: unknown
}

interface WinnerOrder {
  orderNo: string
  member: string
  spec: string
  qty: number
  paid: boolean
  createdAt: string
  /** 對應的規格名（解析自 spec 字串），給訂單明細彈窗用 */
  specName: string
}

interface Props {
  visible?: boolean
  product?: ProductLike
}
const props = withDefaults(defineProps<Props>(), {
  visible: false,
  product: () => ({}),
})
const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const innerVisible = ref(props.visible)
/** 解除訂單記在這個 set；visibleOrders 會過濾掉。每次打開 dialog 重置。 */
const removedOrderNos = ref<Set<string>>(new Set())

watch(() => props.visible, v => {
  innerVisible.value = v
  if (v) removedOrderNos.value = new Set()
})

// 佔位得標人姓名池（mock；實際串接時改為從 API 取）
const WINNER_MEMBERS = ['王小明', '陳大天', '黃大名', '林小美', '張曉明']

// 得標清單依該商品的實際規格產生：每個規格一列，名稱/規格與商品卡一致；無規格時只顯示商品名
const orders = computed<WinnerOrder[]>(() => {
  const code = (props.product.sku || '').split('-')[0] || 'PRD'
  const name = props.product.name || t('live_order.table.value.unnamed_product')
  const specNames = (props.product.specs ?? [])
    .map(s => s?.name)
    .filter((n): n is string => Boolean(n))
  const rows: Array<string | null> = specNames.length ? specNames : [null]
  return rows.map((specName, i) => ({
    orderNo: `#${code}-${String(i + 1).padStart(4, '0')}`,
    member: WINNER_MEMBERS[i % WINNER_MEMBERS.length],
    spec: specName ? `${name} / ${specName}` : name,
    specName: specName ?? '',
    qty: 1 + (i % 2),
    paid: i % 2 === 0,
    createdAt: `06/03 09:5${(2 + i) % 10}`,
  }))
})

const visibleOrders = computed(() => orders.value.filter(o => !removedOrderNos.value.has(o.orderNo)))

const subtotal = computed(() => {
  const price = props.product.price ?? 0
  return visibleOrders.value.reduce((sum, o) => sum + price * o.qty, 0)
})

// 訂單明細彈窗：用得標清單行的資料合成一筆 mock comment + items
const detailVisible = ref(false)
const detailOrder = ref<WinnerOrder | null>(null)
const detailComment = computed(() => {
  const o = detailOrder.value
  return {
    id: o?.orderNo ?? '',
    user: o?.member ?? '',
    text: o?.spec ?? '',
    time: o?.createdAt ?? '',
  }
})
const detailItems = computed(() => {
  const o = detailOrder.value
  if (!o) return []
  const specPrice = props.product.specs?.find(s => s?.name === o.specName)?.price
  const unitPrice = (specPrice as number | undefined) ?? props.product.price ?? 0
  return [{
    name: props.product.name ?? '',
    spec: o.specName,
    qty: o.qty,
    unitPrice,
    isGift: !!props.product.isGift,
  }]
})
function openDetail(order: WinnerOrder): void {
  detailOrder.value = order
  detailVisible.value = true
}
function removeOrder(orderNo?: string): void {
  if (!orderNo) return
  removedOrderNos.value = new Set([...removedOrderNos.value, orderNo])
}
</script>

<!-- 結帳狀態為功能色（已結帳=綠 / 未結帳=琥珀），依 style-class-rule §4.2 例外保留寫死 -->
<style scoped>
.checkout-paid {
  @apply bg-[#dcfce7] text-[#16a34a];
}
.checkout-unpaid {
  @apply bg-[#fef3c7] text-[#d97706];
}
</style>
