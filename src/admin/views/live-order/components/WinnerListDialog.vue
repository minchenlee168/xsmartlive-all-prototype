<template>
  <Dialog
    v-model:visible="innerVisible"
    modal :draggable="false"
    :style="{ width: '900px' }"
    :pt="{
      header:  { style: 'padding: 17.5px' },
      content: { style: 'padding: 0 17.5px 17.5px' },
    }"
    @update:visible="v => emit('update:visible', v)">

    <template #header>
      <span class="font-semibold text-[var(--p-text-color)]" style="font-size:17.5px">{{ t('live_order.dialog.winner_list_header') }}</span>
    </template>

    <div class="flex flex-col gap-4">
      <DataTable :value="orders" :striped-rows="true" class="w-full">
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
          <template #body>
            <button class="text-[14px] font-medium text-[var(--p-primary-color)] hover:underline">
              {{ t('live_order.tooltip.order_detail') }}
            </button>
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
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface ProductSpec {
  name?: string
  stock?: number
  sold?: number
  [key: string]: unknown
}

interface ProductLike {
  id?: number
  name?: string
  sku?: string
  price?: number
  specs?: ProductSpec[]
  [key: string]: unknown
}

interface WinnerOrder {
  orderNo: string
  member: string
  spec: string
  qty: number
  paid: boolean
  createdAt: string
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
watch(() => props.visible, v => { innerVisible.value = v })

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
    qty: 1 + (i % 2),
    paid: i % 2 === 0,
    createdAt: `06/03 09:5${(2 + i) % 10}`,
  }))
})

const subtotal = computed(() => {
  const price = props.product.price ?? 0
  return orders.value.reduce((sum, o) => sum + price * o.qty, 0)
})
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
