<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * 單規格商品快速新增表單；只在已選擇場次時顯示。
 *
 * 4 個欄位：名稱、關鍵字、售價、庫存。支援多列批次新增：
 * - 預設 1 列，可加減列
 * - 「全部加入」按一次送出所有「名稱 + 售價」皆有填的列
 * - 名稱或售價未填的列略過，不阻擋送出
 */

interface QuickAddProductPayload {
  id: number
  name: string
  keyword: string
  price: number
  stock: number
  /** 單規格商品：specs 留空陣列 */
  specs: never[]
}

interface Row {
  rowId: number
  name: string
  keyword: string
  price: number | null
  stock: number | null
}

const emit = defineEmits<{
  submit: [payloads: QuickAddProductPayload[]]
}>()

const { t } = useI18n()

let rowSeq = 0
function makeRow(): Row {
  rowSeq += 1
  return { rowId: rowSeq, name: '', keyword: '', price: null, stock: null }
}

const rows = ref<Row[]>([makeRow()])
const isExpanded = ref(true)

function toggleExpanded(): void {
  isExpanded.value = !isExpanded.value
}

function isRowValid(row: Row): boolean {
  return row.name.trim().length > 0 && typeof row.price === 'number' && row.price >= 0
}

const validCount = computed(() => rows.value.filter(isRowValid).length)

function addRow(): void {
  rows.value.push(makeRow())
}

function removeRow(rowId: number): void {
  if (rows.value.length <= 1) return
  rows.value = rows.value.filter((r) => r.rowId !== rowId)
}

function resetRows(): void {
  rows.value = [makeRow()]
}

function onSubmit(): void {
  const valid = rows.value.filter(isRowValid)
  if (valid.length === 0) return
  const baseId = Date.now()
  const payloads = valid.map<QuickAddProductPayload>((row, idx) => ({
    id: baseId + idx,
    name: row.name.trim(),
    keyword: row.keyword.trim(),
    price: row.price ?? 0,
    stock: row.stock ?? 0,
    specs: [],
  }))
  emit('submit', payloads)
  resetRows()
  isExpanded.value = false
}
</script>

<template>
  <div
    class="flex flex-col gap-2 rounded-md border border-[var(--p-content-border-color)] bg-[var(--p-content-background)] p-3"
  >
    <div class="flex items-center justify-between">
      <span class="text-[13px] font-medium text-[var(--p-text-muted-color)]">
        {{ t('live_order.quick_add.title') }}
      </span>
      <Button
        v-tooltip.top="
          isExpanded
            ? t('live_order.quick_add.button.collapse')
            : t('live_order.quick_add.button.expand')
        "
        :icon="isExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
        severity="secondary"
        variant="text"
        rounded
        size="small"
        @click="toggleExpanded"
      />
    </div>

    <div v-if="isExpanded" class="flex flex-col gap-1.5">
      <div
        v-for="row in rows"
        :key="row.rowId"
        class="flex flex-wrap items-center gap-2"
      >
        <InputText
          v-model="row.name"
          :placeholder="t('live_order.quick_add.placeholder.name')"
          class="!w-[200px]"
          size="small"
          @keyup.enter="onSubmit"
        />
        <InputText
          v-model="row.keyword"
          :placeholder="t('live_order.quick_add.placeholder.keyword')"
          class="!w-[120px]"
          size="small"
          @keyup.enter="onSubmit"
        />
        <InputNumber
          v-model="row.price"
          :placeholder="t('live_order.quick_add.placeholder.price')"
          :min="0"
          :use-grouping="false"
          input-class="!w-[110px]"
          size="small"
          @keyup.enter="onSubmit"
        />
        <InputNumber
          v-model="row.stock"
          :placeholder="t('live_order.quick_add.placeholder.stock')"
          :min="0"
          :use-grouping="false"
          input-class="!w-[110px]"
          size="small"
          @keyup.enter="onSubmit"
        />
        <Button
          v-tooltip.top="t('live_order.quick_add.button.remove_row')"
          icon="pi pi-times"
          severity="secondary"
          variant="text"
          rounded
          size="small"
          :disabled="rows.length <= 1"
          @click="removeRow(row.rowId)"
        />
      </div>
    </div>

    <div v-if="isExpanded" class="flex items-center gap-2">
      <Button
        :label="t('live_order.quick_add.button.add_row')"
        icon="pi pi-plus"
        severity="secondary"
        variant="outlined"
        size="small"
        @click="addRow"
      />
      <Button
        :label="t('live_order.quick_add.button.add_all', { count: validCount })"
        icon="pi pi-check"
        size="small"
        :disabled="validCount === 0"
        @click="onSubmit"
      />
    </div>
  </div>
</template>
