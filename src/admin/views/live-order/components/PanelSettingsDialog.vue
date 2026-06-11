<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * 面板設定彈窗。
 *
 * 由「批次設定」的 SplitButton 下拉開啟；蒐集兩欄式設定：
 * - 左欄：得標規則 / 列印 / 自動補單 / 商品開單後行為
 * - 右欄：加購區下架天數 / 留言推送 / 商品卡顯示欄位
 *
 * 原型階段以本地 model 暫存設定，按下儲存 emit('save', value)。
 */

export interface PanelSettings {
  duplicateWinnerMode: string
  plusOneRule: string
  autoPreviewPrint: boolean
  noPreviewPrint: boolean
  autoReorder: boolean
  autoSaveAfterOpen: boolean
  allowKeywordCancel: boolean
  addonRemoveDays: number
  notifyProductSales: boolean
  notifyWinnerList: boolean
  notifySpecSoldOut: boolean
  showMultiCart: boolean
  showSpec: boolean
  showCheckoutSpec: boolean
  showSku: boolean
  showCost: boolean
  showStock: boolean
  showWeight: boolean
  showOversell: boolean
  showPlusOneLimit: boolean
  showStarFilter: boolean
}

interface Props {
  visible?: boolean
  settings: PanelSettings
}
const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [settings: PanelSettings]
}>()

const { t } = useI18n()

/** 內部編輯 buffer，打開時 deep clone props.settings；按儲存才 emit。 */
const form = ref<PanelSettings>(clone(props.settings))

watch(
  () => props.visible,
  (v) => { if (v) form.value = clone(props.settings) },
)

function clone(s: PanelSettings): PanelSettings { return { ...s } }

function onVisibleChange(v: boolean): void { emit('update:visible', v) }

function onSave(): void {
  emit('save', clone(form.value))
  onVisibleChange(false)
}

const duplicateWinnerOptions = computed(() => [
  { label: t('live_order.panel_setting.duplicate_winner_latest'), value: 'latest' },
  { label: t('live_order.panel_setting.duplicate_winner_first'),  value: 'first'  },
  { label: t('live_order.panel_setting.duplicate_winner_merge'),  value: 'merge'  },
])
const plusOneRuleOptions = computed(() => [
  { label: t('live_order.panel_setting.plus_one_standard'), value: 'standard' },
  { label: t('live_order.panel_setting.plus_one_strict'),   value: 'strict'   },
])

</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :draggable="false"
    :dismissable-mask="true"
    :style="{ width: '720px' }"
    :pt="{
      header: { style: 'padding: 16px 20px' },
      content: { style: 'padding: 0 20px 16px' },
      footer: { style: 'padding: 12px 20px' },
    }"
    @update:visible="onVisibleChange"
  >
    <template #header>
      <div class="flex items-baseline gap-2">
        <span class="font-semibold text-[var(--p-text-color)]" style="font-size: 16px">
          {{ t('live_order.panel_setting.header') }}
        </span>
        <span class="text-[12.5px] font-medium text-[#dc2626]">
          {{ t('live_order.panel_setting.todo_note') }}
        </span>
      </div>
    </template>

    <div class="grid grid-cols-2 gap-x-6 gap-y-4 text-[13px]">

      <!-- ── 左欄 ─────────────────────────────────── -->
      <div class="flex flex-col gap-4">

        <!-- 得標人重複留言判定模式 -->
        <div class="flex flex-col gap-1.5">
          <label class="font-medium text-[var(--p-text-color)]">
            {{ t('live_order.panel_setting.duplicate_winner_mode') }}
          </label>
          <Select
            v-model="form.duplicateWinnerMode"
            :options="duplicateWinnerOptions"
            option-label="label"
            option-value="value"
            size="small"
          />
        </div>

        <!-- +1得標規則 -->
        <div class="flex flex-col gap-1.5">
          <label class="font-medium text-[var(--p-text-color)]">
            {{ t('live_order.panel_setting.plus_one_rule') }}
          </label>
          <Select
            v-model="form.plusOneRule"
            :options="plusOneRuleOptions"
            option-label="label"
            option-value="value"
            size="small"
          />
        </div>

        <!-- 列印出貨單 -->
        <div class="flex flex-col gap-1.5">
          <label class="font-medium text-[var(--p-text-color)]">
            {{ t('live_order.panel_setting.print_shipment') }}
          </label>
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2">
              <ToggleSwitch v-model="form.autoPreviewPrint" />
              <span class="text-[12.5px] text-[var(--p-text-color)]">
                {{ t('live_order.panel_setting.auto_preview_print') }}
              </span>
            </label>
            <label class="flex items-center gap-2">
              <ToggleSwitch v-model="form.noPreviewPrint" />
              <span class="text-[12.5px] text-[var(--p-text-color)]">
                {{ t('live_order.panel_setting.no_preview_print') }}
              </span>
            </label>
          </div>
          <span class="text-[11.5px] text-[var(--p-text-muted-color)]">
            {{ t('live_order.panel_setting.no_printer_hint') }}
          </span>
        </div>

        <!-- 自動補單 + 注意事項 -->
        <div class="flex flex-col gap-1.5">
          <label class="font-medium text-[var(--p-text-color)]">
            {{ t('live_order.panel_setting.auto_reorder') }}
          </label>
          <div class="flex items-center gap-2">
            <ToggleSwitch v-model="form.autoReorder" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">
              {{ form.autoReorder
                ? t('live_order.panel_setting.auto_reorder_active')
                : t('live_order.panel_setting.auto_reorder_inactive') }}
            </span>
            <a class="text-[12.5px] text-[var(--p-primary-color)] cursor-pointer hover:underline ml-1">
              <i class="pi pi-info-circle mr-0.5" style="font-size: 11px"></i>
              {{ t('live_order.panel_setting.explanation') }}
            </a>
          </div>
          <div class="rounded-[6px] bg-[#fef9c3] border border-[#fde047] px-3 py-2 mt-1 flex flex-col gap-0.5">
            <span class="text-[12px] font-semibold text-[#854d0e]">
              {{ t('live_order.panel_setting.auto_reorder_notes_title') }}
            </span>
            <span class="text-[11.5px] text-[#854d0e] leading-relaxed">{{ t('live_order.panel_setting.auto_reorder_note_1') }}</span>
            <span class="text-[11.5px] text-[#854d0e] leading-relaxed">{{ t('live_order.panel_setting.auto_reorder_note_2') }}</span>
            <span class="text-[11.5px] text-[#854d0e] leading-relaxed">{{ t('live_order.panel_setting.auto_reorder_note_3') }}</span>
            <a class="text-[11.5px] text-[var(--p-primary-color)] cursor-pointer hover:underline mt-0.5">
              <i class="pi pi-info-circle mr-0.5" style="font-size: 10px"></i>
              {{ t('live_order.panel_setting.instant_winner_doc') }}
            </a>
          </div>
        </div>

        <!-- 商品開單後自動轉已儲存 -->
        <div class="flex flex-col gap-1.5">
          <label class="font-medium text-[var(--p-text-color)]">
            {{ t('live_order.panel_setting.auto_save_after_open') }}
          </label>
          <div class="flex items-center gap-2">
            <ToggleSwitch v-model="form.autoSaveAfterOpen" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">
              {{ form.autoSaveAfterOpen
                ? t('live_order.panel_setting.auto_reorder_active')
                : t('live_order.panel_setting.auto_reorder_inactive') }}
            </span>
            <a class="text-[12.5px] text-[var(--p-primary-color)] cursor-pointer hover:underline ml-1">
              <i class="pi pi-info-circle mr-0.5" style="font-size: 11px"></i>
              {{ t('live_order.panel_setting.explanation') }}
            </a>
          </div>
        </div>

        <!-- 允許關鍵字取消下單 -->
        <div class="flex flex-col gap-1.5">
          <label class="font-medium text-[var(--p-text-color)]">
            {{ t('live_order.panel_setting.allow_keyword_cancel') }}
          </label>
          <div class="flex items-center gap-2">
            <ToggleSwitch v-model="form.allowKeywordCancel" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">
              {{ form.allowKeywordCancel
                ? t('live_order.panel_setting.allow')
                : t('live_order.panel_setting.deny') }}
            </span>
            <a class="text-[12.5px] text-[var(--p-primary-color)] cursor-pointer hover:underline ml-1">
              <i class="pi pi-info-circle mr-0.5" style="font-size: 11px"></i>
              {{ t('live_order.panel_setting.explanation') }}
            </a>
          </div>
        </div>

      </div>

      <!-- ── 右欄 ─────────────────────────────────── -->
      <div class="flex flex-col gap-4">

        <!-- 加購區預設下架天數 -->
        <div class="flex flex-col gap-2">
          <label class="font-medium text-[var(--p-text-color)]">
            {{ t('live_order.panel_setting.addon_remove_days', { n: form.addonRemoveDays }) }}
          </label>
          <Slider v-model="form.addonRemoveDays" :min="0" :max="30" :step="1" class="w-full" />
        </div>

        <!-- 留言設定選項 -->
        <div class="flex flex-col gap-2">
          <label class="font-medium text-[var(--p-text-color)]">
            {{ t('live_order.panel_setting.comment_setting_section') }}
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.notifyProductSales" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">
              {{ t('live_order.panel_setting.notify_product_sales') }}
            </span>
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.notifyWinnerList" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">
              {{ t('live_order.panel_setting.notify_winner_list') }}
            </span>
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.notifySpecSoldOut" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">
              {{ t('live_order.panel_setting.notify_spec_sold_out') }}
            </span>
          </label>
          <span class="text-[11.5px] text-[var(--p-text-muted-color)] leading-relaxed">
            {{ t('live_order.panel_setting.notify_spec_hint') }}
          </span>
        </div>

        <!-- 商品設定選項 -->
        <div class="flex flex-col gap-2">
          <label class="font-medium text-[var(--p-text-color)]">
            {{ t('live_order.panel_setting.product_setting_section') }}
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.showMultiCart" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">{{ t('live_order.panel_setting.show_multi_cart') }}</span>
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.showSpec" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">{{ t('live_order.panel_setting.show_spec') }}</span>
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.showCheckoutSpec" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">{{ t('live_order.panel_setting.show_checkout_spec') }}</span>
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.showSku" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">{{ t('live_order.panel_setting.show_sku') }}</span>
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.showCost" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">{{ t('live_order.panel_setting.show_cost') }}</span>
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.showStock" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">{{ t('live_order.panel_setting.show_stock') }}</span>
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.showWeight" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">{{ t('live_order.panel_setting.show_weight') }}</span>
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.showOversell" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">{{ t('live_order.panel_setting.show_oversell') }}</span>
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.showPlusOneLimit" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">{{ t('live_order.panel_setting.show_plus_one_limit') }}</span>
          </label>
          <label class="flex items-center gap-2">
            <Checkbox v-model="form.showStarFilter" :binary="true" />
            <span class="text-[12.5px] text-[var(--p-text-color)]">{{ t('live_order.panel_setting.show_star_filter') }}</span>
          </label>
        </div>

      </div>
    </div>

    <template #footer>
      <div class="flex justify-end w-full">
        <Button
          :label="t('live_order.panel_setting.save')"
          icon="pi pi-save"
          severity="success"
          @click="onSave"
        />
      </div>
    </template>
  </Dialog>
</template>
