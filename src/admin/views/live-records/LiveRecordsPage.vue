<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import EmptyState from '@/admin/components/ui/EmptyState.vue'
import { liveOrderRecords } from '@/admin/views/live-order/utils/liveOrderRecords'

/**
 * 收單紀錄頁：顯示所有已完成 / 進行中場次的彙總資料。
 * Mock 資料；實際串接會走 fetch sessions list API。
 */
interface SessionRecord {
  id: number
  name: string
  date: string
  productCount: number
  orderCount: number
  amount: number
  sourceCount: number
  status: 'ongoing' | 'ended'
}

const { t } = useI18n()

const filterValue = ref<'all' | 'this_week' | 'this_month' | 'last_month'>('all')
const filterOptions = computed(() => [
  { label: t('live_records.filter.all'), value: 'all' },
  { label: t('live_records.filter.this_week'), value: 'this_week' },
  { label: t('live_records.filter.this_month'), value: 'this_month' },
  { label: t('live_records.filter.last_month'), value: 'last_month' },
])

const mockRecords: SessionRecord[] = [
  { id: 1001, name: '春季首播', date: '2026/05/13', productCount: 12, orderCount: 145, amount: 28960, sourceCount: 2, status: 'ended' },
  { id: 1002, name: '母親節特賣', date: '2026/05/10', productCount: 18, orderCount: 230, amount: 56780, sourceCount: 3, status: 'ended' },
  { id: 1003, name: '六月開團', date: '2026/06/01', productCount: 8, orderCount: 67, amount: 14530, sourceCount: 1, status: 'ongoing' },
  { id: 1004, name: '夏日清倉', date: '2026/06/02', productCount: 25, orderCount: 0, amount: 0, sourceCount: 0, status: 'ongoing' },
]

/** 收單頁結束收單寫進的紀錄（reactive shared）合併 mock 種子。 */
const records = computed<SessionRecord[]>(() => [
  ...liveOrderRecords.map((r) => ({
    id: r.id,
    name: r.sessionName,
    date: r.endedAt.slice(0, 10).replace(/-/g, '/'),
    productCount: r.productCount,
    orderCount: r.orderCount,
    amount: r.totalAmount,
    sourceCount: 0,
    status: 'ended' as const,
  })),
  ...mockRecords,
])

function statusBadgeClass(status: SessionRecord['status']): string {
  return status === 'ongoing'
    ? 'bg-[#dcfce7] text-[#15803d]'
    : 'bg-[var(--p-content-hover-background)] text-[var(--p-text-muted-color)]'
}

function formatAmount(amount: number): string {
  return `$${amount.toLocaleString()}`
}
</script>

<template>
  <div class="flex flex-col gap-4 flex-1 min-h-0">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h1 class="text-[20px] font-bold text-[var(--p-text-color)]">
        {{ t('live_records.title') }}
      </h1>
      <div class="flex items-center gap-2">
        <Select
          v-model="filterValue"
          :options="filterOptions"
          option-label="label"
          option-value="value"
          class="w-[140px]"
        />
        <Button
          :label="t('live_records.button.export')"
          icon="pi pi-download"
          severity="secondary"
          variant="outlined"
        />
      </div>
    </div>

    <!-- Empty state -->
    <EmptyState
      v-if="records.length === 0"
      :title="t('live_records.empty.no_records')"
      :description="t('live_records.empty.no_records_hint')"
    />

    <!-- Records table -->
    <div
      v-else
      class="bg-[var(--p-content-background)] rounded-[8px] border border-[var(--p-content-border-color)] overflow-hidden"
    >
      <table class="w-full border-collapse">
        <thead class="bg-[var(--p-content-hover-background)]">
          <tr>
            <th class="px-4 py-3 text-left text-[13px] font-semibold text-[var(--p-text-color)]">
              {{ t('live_records.table.column.session') }}
            </th>
            <th class="px-4 py-3 text-left text-[13px] font-semibold text-[var(--p-text-color)]">
              {{ t('live_records.table.column.date') }}
            </th>
            <th class="px-4 py-3 text-right text-[13px] font-semibold text-[var(--p-text-color)]">
              {{ t('live_records.table.column.products') }}
            </th>
            <th class="px-4 py-3 text-right text-[13px] font-semibold text-[var(--p-text-color)]">
              {{ t('live_records.table.column.orders') }}
            </th>
            <th class="px-4 py-3 text-right text-[13px] font-semibold text-[var(--p-text-color)]">
              {{ t('live_records.table.column.amount') }}
            </th>
            <th class="px-4 py-3 text-center text-[13px] font-semibold text-[var(--p-text-color)]">
              {{ t('live_records.table.column.status') }}
            </th>
            <th class="px-4 py-3 text-center text-[13px] font-semibold text-[var(--p-text-color)]">
              {{ t('live_records.table.column.actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="r in records"
            :key="r.id"
            class="border-t border-[var(--p-content-border-color)] hover:bg-[var(--p-content-hover-background)]"
          >
            <td class="px-4 py-3">
              <div class="flex flex-col gap-0.5">
                <span class="text-[14px] font-medium text-[var(--p-text-color)]">
                  {{ r.name }}
                </span>
                <span class="text-[12px] text-[var(--p-text-muted-color)]">
                  {{ t('live_records.label.sources_count', { count: r.sourceCount }) }}
                </span>
              </div>
            </td>
            <td class="px-4 py-3 text-[14px] text-[var(--p-text-color)]">
              {{ r.date }}
            </td>
            <td class="px-4 py-3 text-right text-[14px] text-[var(--p-text-color)]">
              {{ r.productCount }}
            </td>
            <td class="px-4 py-3 text-right text-[14px] text-[var(--p-text-color)]">
              {{ r.orderCount }}
            </td>
            <td class="px-4 py-3 text-right text-[14px] font-bold text-[var(--p-primary-color)]">
              {{ formatAmount(r.amount) }}
            </td>
            <td class="px-4 py-3 text-center">
              <span
                :class="['inline-block px-2 py-1 rounded-[12px] text-[12px] font-medium', statusBadgeClass(r.status)]"
              >
                {{ t(`live_records.status.${r.status}`) }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <Button
                :label="t('live_records.button.view_detail')"
                severity="secondary"
                variant="text"
                size="small"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
