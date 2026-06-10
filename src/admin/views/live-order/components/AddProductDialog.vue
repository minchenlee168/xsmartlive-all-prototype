<template>
  <Dialog
    v-model:visible="innerVisible"
    modal
    :draggable="false"
    :style="{ width: '1100px' }"
    :pt="{
      header: { style: 'padding: 17.5px' },
      content: { style: 'padding: 0 17.5px 17.5px' },
      footer: { style: 'padding: 0 17.5px 17.5px' },
    }"
    @update:visible="(v) => emit('update:visible', v)"
  >
    <template #header>
      <span class="font-semibold text-[var(--p-text-color)]" style="font-size: 17.5px">
        {{
          step === 'pick'
            ? t('live_order.dialog.pick_product_header')
            : t('live_order.dialog.order_setting_header')
        }}
      </span>
    </template>

    <!-- 步驟指示（對齊批次編輯彈窗） -->
    <div class="flex items-center gap-2 pt-2">
      <template v-for="(s, i) in pickSteps" :key="s.step">
        <div class="flex items-center gap-2">
          <span
            class="w-[24px] h-[24px] rounded-full flex items-center justify-center text-[13px] font-bold"
            :class="stepNum >= s.step
              ? 'bg-[var(--p-primary-color)] text-white'
              : 'bg-[var(--p-content-hover-background)] text-[var(--p-text-muted-color)]'"
          >{{ s.step }}</span>
          <span
            class="text-[14px] font-medium"
            :class="stepNum === s.step ? 'text-[var(--p-text-color)]' : 'text-[var(--p-text-muted-color)]'"
          >{{ s.label }}</span>
        </div>
        <div v-if="i < pickSteps.length - 1" class="flex-1 h-px bg-[var(--p-content-border-color)]"></div>
      </template>
    </div>
    <div class="border-t border-[var(--p-content-border-color)] mt-3"></div>

    <!-- Step 1：選擇商品 -->
    <div v-if="step === 'pick'" class="flex flex-col gap-4 pt-3">
      <div class="flex gap-4 items-end flex-wrap">
        <div class="flex flex-col gap-2">
          <label class="text-[14px] font-medium text-[var(--p-text-color)]">
            {{ t('live_order.form.field.category') }}
          </label>
          <Select
            v-model="pickerCategory"
            :options="[
              { label: t('live_order.form.placeholder.all_categories'), value: null },
              ...productCategories,
            ]"
            option-label="label"
            option-value="value"
            :placeholder="t('live_order.form.placeholder.all_categories')"
            class="w-[220px]"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-[14px] font-medium text-[var(--p-text-color)]">
            {{ t('live_order.form.field.search') }}
          </label>
          <div class="flex h-[42px]">
            <Select
              v-model="pickerSearchField"
              :options="pickerSearchFields"
              option-label="label"
              option-value="value"
              class="w-[130px]"
              style="border-top-right-radius: 0; border-bottom-right-radius: 0; border-right: 0"
            />
            <InputText
              v-model="pickerKeyword"
              :placeholder="t('live_order.form.placeholder.quick_search_products')"
              class="w-[260px]"
              style="border-radius: 0"
            />
            <button
              class="bg-[var(--p-primary-color)] text-white w-[35px] rounded-r-[6px] flex items-center justify-center shrink-0"
            >
              <i class="pi pi-search text-[14px]"></i>
            </button>
          </div>
        </div>
        <label class="flex items-center gap-[7px] cursor-pointer ml-auto">
          <Checkbox v-model="pickerOnlyAvailable" binary />
          <span class="text-[14px] text-[var(--p-text-color)]">
            {{ t('live_order.label.only_show_available') }}
          </span>
        </label>
      </div>

      <div class="overflow-x-auto">
        <div style="min-width: 880px">
          <div
            class="bg-[var(--p-content-background)] border-b border-[var(--p-content-border-color)] flex items-center px-4"
          >
            <div class="px-2 py-[6px] shrink-0 w-[28px]"></div>
            <div
              class="px-2 py-[6px] font-bold text-[15px] text-[var(--p-text-color)] shrink-0"
              style="width: 380px"
            >
              {{ t('live_order.label.product_name_spec') }}
            </div>
            <div
              class="px-2 py-[6px] font-bold text-[15px] text-[var(--p-text-color)] shrink-0"
              style="width: 120px"
            >
              {{ t('live_order.label.cost') }}
            </div>
            <div
              class="px-2 py-[6px] font-bold text-[15px] text-[var(--p-text-color)] shrink-0"
              style="width: 120px"
            >
              {{ t('live_order.label.price') }}
            </div>
            <div
              class="px-2 py-[6px] font-bold text-[15px] text-[var(--p-text-color)] shrink-0"
              style="width: 100px"
            >
              {{ t('live_order.label.stock') }}
            </div>
            <div class="px-2 py-[6px] shrink-0 ml-auto" style="width: 80px"></div>
          </div>

          <template v-for="p in pagedPickerProducts" :key="p.id">
            <div
              :class="[
                'flex items-center w-full px-4',
                pickerExpanded.includes(p.id) && p.specs?.length
                  ? 'bg-[var(--p-content-hover-background)]'
                  : 'border-b border-[var(--p-content-border-color)]',
              ]"
            >
              <div class="px-2 py-[6px] shrink-0 w-[28px]">
                <button
                  v-if="p.specs?.length"
                  @click="togglePickerExpand(p.id)"
                  class="w-full flex items-center justify-center"
                >
                  <i
                    :class="[
                      'pi text-[14px] text-[var(--p-text-muted-color)]',
                      pickerExpanded.includes(p.id) ? 'pi-chevron-up' : 'pi-chevron-down',
                    ]"
                  ></i>
                </button>
              </div>
              <div class="px-2 py-[6px] flex gap-3 items-center shrink-0" style="width: 380px">
                <div
                  class="w-[48px] h-[48px] rounded-[6px] bg-[var(--p-content-hover-background)] flex items-center justify-center shrink-0"
                >
                  <i class="pi pi-image text-[18px] text-[var(--p-text-muted-color)]"></i>
                </div>
                <div class="flex flex-col gap-[2px]">
                  <span class="font-medium text-[15px] text-[var(--p-text-color)]">
                    {{ p.name }}
                  </span>
                  <span class="text-[12px] text-[var(--p-text-muted-color)]">{{ p.sku }}</span>
                </div>
              </div>
              <div class="px-2 py-[6px] shrink-0" style="width: 120px">
                <span class="text-[15px] text-[var(--p-text-color)]">
                  {{ p.cost.toLocaleString() }}
                </span>
              </div>
              <div class="px-2 py-[6px] shrink-0" style="width: 120px">
                <span class="text-[15px] text-[var(--p-text-color)]">
                  {{ p.price.toLocaleString() }}
                </span>
              </div>
              <div class="px-2 py-[6px] shrink-0" style="width: 100px">
                <span
                  class="text-[15px]"
                  :class="p.stock <= 10 ? 'text-[#ef4444]' : 'text-[var(--p-text-color)]'"
                >
                  {{ p.stock }}
                </span>
              </div>
              <div class="px-2 py-[6px] shrink-0 ml-auto flex justify-center" style="width: 80px">
                <Checkbox
                  :model-value="isItemSelected('p-' + p.id)"
                  binary
                  @change="toggleProduct(p)"
                />
              </div>
            </div>

            <template v-if="pickerExpanded.includes(p.id) && p.specs?.length">
              <div
                v-for="(spec, si) in p.specs"
                :key="spec.id"
                :class="[
                  'bg-[var(--p-content-hover-background)] flex items-center px-[40px]',
                  si === p.specs.length - 1
                    ? 'border-b border-[var(--p-content-border-color)]'
                    : '',
                ]"
              >
                <div class="border-l border-[var(--p-content-border-color)] flex h-full items-center w-full">
                  <div class="px-2 py-[6px] flex gap-3 items-center shrink-0" style="width: 380px">
                    <div
                      class="w-[40px] h-[40px] rounded-[6px] bg-[var(--p-content-hover-background)] flex items-center justify-center shrink-0"
                    >
                      <i class="pi pi-image text-[14px] text-[var(--p-text-muted-color)]"></i>
                    </div>
                    <div class="flex flex-col gap-[2px]">
                      <span class="font-medium text-[14px] text-[var(--p-text-color)]">
                        {{ t('live_order.label.spec_label', { name: spec.name }) }}
                      </span>
                      <span class="text-[12px] text-[var(--p-text-muted-color)]">{{ spec.sku }}</span>
                    </div>
                  </div>
                  <div class="px-2 py-[6px] shrink-0" style="width: 120px">
                    <span class="text-[14px] text-[var(--p-text-color)]">
                      {{ spec.cost.toLocaleString() }}
                    </span>
                  </div>
                  <div class="px-2 py-[6px] shrink-0" style="width: 120px">
                    <span class="text-[14px] text-[var(--p-text-color)]">
                      {{ spec.price.toLocaleString() }}
                    </span>
                  </div>
                  <div class="px-2 py-[6px] shrink-0" style="width: 100px">
                    <span
                      class="text-[14px]"
                      :class="spec.stock <= 10 ? 'text-[#ef4444]' : 'text-[var(--p-text-color)]'"
                    >
                      {{ spec.stock }}
                    </span>
                  </div>
                  <div class="px-2 py-[6px] shrink-0 ml-auto flex justify-center" style="width: 80px">
                    <Checkbox
                      :model-value="isItemSelected('s-' + spec.id)"
                      binary
                      @change="toggleSpec(p, spec)"
                    />
                  </div>
                </div>
              </div>
            </template>
          </template>

          <div
            v-if="pagedPickerProducts.length === 0"
            class="flex flex-col items-center justify-center gap-2 py-12"
          >
            <i class="pi pi-inbox text-5xl text-[var(--p-text-muted-color)]"></i>
            <span class="text-[14px] text-[var(--p-text-muted-color)]">
              {{ t('live_order.empty.no_matching_product') }}
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-[14px] text-[var(--p-text-color)]">
          {{ t('live_order.text.total_products', { count: filteredPickerProducts.length }) }}
        </span>
        <Paginator
          :rows="pickerPageSize"
          :total-records="filteredPickerProducts.length"
          v-model:first="pickerPageFirst"
          class="border-0 p-0"
        />
      </div>
    </div>

    <!-- Step 2：下標設定（共同設定一次套用到所有勾選的商品） -->
    <div v-else class="pt-3">
      <OrderSettingForm
        ref="formRef"
        multiple
        :picked-names="selectedNames"
      />
    </div>

    <template #footer>
      <div v-if="step === 'pick'" class="flex justify-end gap-2">
        <Button
          :label="t('live_order.button.cancel')"
          severity="secondary"
          variant="outlined"
          @click="close"
        />
        <Button
          :label="`${t('live_order.button.next_step')} (${selectedCount})`"
          icon="pi pi-arrow-right"
          icon-pos="right"
          :disabled="selectedCount === 0"
          @click="goToForm"
        />
      </div>
      <div v-else class="flex justify-between gap-2">
        <Button
          :label="t('live_order.button.back_to_pick')"
          icon="pi pi-arrow-left"
          severity="secondary"
          variant="outlined"
          @click="onBackToPick"
        />
        <Button
          :label="`${t('live_order.button.save')} (${selectedCount})`"
          icon="pi pi-save"
          :disabled="selectedCount === 0"
          @click="onSaveForm"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import OrderSettingForm, { type OrderSettingFormData } from './OrderSettingForm.vue'
import { productCatalog } from '../utils/productCatalog'

interface PickerSpec {
  id: number
  name: string
  sku: string
  cost: number
  originalPrice: number
  price: number
  stock: number
}

interface PickerProductRaw {
  id: number
  name: string
  sku: string
  category: string
  price: number
  stock: number
  status: string
}

interface PickerProduct extends PickerProductRaw {
  cost: number
  originalPrice: number
  specs: PickerSpec[]
}

interface ProductFormApi {
  validate: () => boolean
  getSettings: () => OrderSettingFormData
  reset: () => void
}

/** 步驟一勾選的商品 / 規格項目（攜帶基本資料供建立 session 商品）。 */
interface SelectedItem {
  key: string
  name: string
  sku: string
  cost: number
  price: number
  stock: number
}

interface Props {
  visible?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  visible: false,
})
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'add-products': [products: Array<Record<string, unknown>>]
}>()

const { t } = useI18n()

/** 由 picker 帶入後鎖定不可改的欄位（成本/售價/庫存/商品圖） */
const LOCKED_FIELDS = ['cost', 'price', 'stock', 'image']

const innerVisible = ref(props.visible)
const step = ref<'pick' | 'form'>('pick')

// 步驟指示器：選擇商品(1) → 下標設定(2)
const stepNum = computed(() => (step.value === 'pick' ? 1 : 2))
const pickSteps = computed(() => [
  { step: 1, label: t('live_order.dialog.pick_product_header') },
  { step: 2, label: t('live_order.dialog.order_setting_header') },
])
const formRef = ref<ProductFormApi | null>(null)

/** 跨展開/分頁記憶已勾選的項目；key = `p-{id}`（整個商品）或 `s-{id}`（單一規格）。 */
const selectedItems = ref<Map<string, SelectedItem>>(new Map())
const selectedCount = computed(() => selectedItems.value.size)
const selectedNames = computed(() => Array.from(selectedItems.value.values()).map(it => it.name))

watch(
  () => props.visible,
  (v) => {
    innerVisible.value = v
    if (v) {
      step.value = 'pick'
      selectedItems.value = new Map()
      resetPicker()
    }
  },
)

function close(): void {
  innerVisible.value = false
  emit('update:visible', false)
}

function isItemSelected(key: string): boolean {
  return selectedItems.value.has(key)
}

function toggleItem(item: SelectedItem): void {
  const map = new Map(selectedItems.value)
  if (map.has(item.key)) {
    map.delete(item.key)
  } else {
    map.set(item.key, item)
  }
  selectedItems.value = map
}

/** 勾選整個商品（不指定規格），帶整體 cost/price/stock。 */
function toggleProduct(p: PickerProduct): void {
  toggleItem({
    key: `p-${p.id}`,
    name: p.name,
    sku: p.sku,
    cost: p.cost,
    price: p.price,
    stock: p.stock,
  })
}

/** 勾選單一規格，name 帶「商品 - 規格」格式、用 spec 的 cost/price/stock。 */
function toggleSpec(p: PickerProduct, spec: PickerSpec): void {
  toggleItem({
    key: `s-${spec.id}`,
    name: `${p.name} - ${spec.name}`,
    sku: spec.sku,
    cost: spec.cost,
    price: spec.price,
    stock: spec.stock,
  })
}

/** 進入下標設定步驟（至少勾一項）。 */
function goToForm(): void {
  if (selectedItems.value.size === 0) return
  step.value = 'form'
}

function onBackToPick(): void {
  step.value = 'pick'
}

/** 儲存：把共同下標設定套用到每個勾選的商品，emit add-products 後關 dialog。 */
function onSaveForm(): void {
  if (!formRef.value?.validate()) return
  const settings = formRef.value.getSettings()
  const base = Date.now()
  const products = Array.from(selectedItems.value.values()).map((it, i) => ({
    ...settings,
    // 每個商品各自一份數量優惠，避免共用同一陣列參考
    quantityDiscounts: settings.quantityDiscounts.map(t => ({ ...t })),
    id: base + i,
    name: it.name,
    cost: it.cost,
    price: it.price,
    stock: it.stock,
    sku: it.sku,
  }))
  emit('add-products', products)
  close()
}

// ── Picker 資料 ───────────────────────────────────
const productCategories = computed(() => [
  { label: t('live_order.category.electronics'), value: '3C 電子' },
  { label: t('live_order.category.gaming'),      value: '電玩周邊' },
  { label: t('live_order.category.accessory'),   value: '配件' },
  { label: t('live_order.category.headphone'),   value: '耳機' },
])
const pickerSpecsMap: Record<number, PickerSpec[]> = {
  1: [
    { id: 101, name: '透明', sku: 'ACC-IP15P-001-CL', cost: 295, originalPrice: 588, price: 490, stock: 40 },
    { id: 102, name: '黑色', sku: 'ACC-IP15P-001-BK', cost: 295, originalPrice: 588, price: 490, stock: 30 },
    { id: 103, name: '深藍', sku: 'ACC-IP15P-001-NV', cost: 295, originalPrice: 588, price: 490, stock: 15 },
  ],
  3: [
    { id: 301, name: '灰色 / 普通版', sku: 'GAM-NSW-001-GR', cost: 5880, originalPrice: 11760, price: 9800, stock: 3 },
    { id: 302, name: '紅色 / 特別版', sku: 'GAM-NSW-001-RD', cost: 5880, originalPrice: 11760, price: 9800, stock: 3 },
  ],
  5: [
    { id: 501, name: '55 吋', sku: '3C-SAM-TV55', cost: 20000, originalPrice: 51480, price: 42900, stock: 2 },
    { id: 502, name: '65 吋', sku: '3C-SAM-TV65', cost: 25740, originalPrice: 51480, price: 42900, stock: 3 },
  ],
  7: [
    { id: 701, name: '黑色 / 青軸', sku: 'GAM-RZR-010-BK-CY', cost: 2100, originalPrice: 4200, price: 3500, stock: 5 },
    { id: 702, name: '白色 / 紅軸', sku: 'GAM-RZR-010-WH-RD', cost: 2100, originalPrice: 4200, price: 3500, stock: 3 },
  ],
}
const pickerProductsRaw: PickerProductRaw[] = productCatalog
const allPickerProducts: PickerProduct[] = pickerProductsRaw.map((p) => ({
  ...p,
  cost:          Math.round(p.price * 0.6),
  originalPrice: Math.round(p.price * 1.2),
  specs:         pickerSpecsMap[p.id] ?? [],
}))

const pickerCategory = ref<string | null>(null)
const pickerSearchField = ref('name')
const pickerKeyword = ref('')
const pickerOnlyAvailable = ref(false)
const pickerExpanded = ref<number[]>([])
const pickerPageFirst = ref(0)
const pickerPageSize = 10
const pickerSearchFields = computed(() => [
  { label: t('live_order.search_field.name'), value: 'name' },
  { label: t('live_order.search_field.sku'),  value: 'sku'  },
])

function resetPicker(): void {
  pickerCategory.value = null
  pickerKeyword.value = ''
  pickerOnlyAvailable.value = false
  pickerExpanded.value = []
  pickerPageFirst.value = 0
}

const filteredPickerProducts = computed(() =>
  allPickerProducts.filter((p) => {
    if (pickerCategory.value && p.category !== pickerCategory.value) return false
    if (pickerOnlyAvailable.value && p.status !== '上架中') return false
    if (pickerKeyword.value) {
      return pickerSearchField.value === 'sku'
        ? p.sku.includes(pickerKeyword.value)
        : p.name.includes(pickerKeyword.value)
    }
    return true
  }),
)
const pagedPickerProducts = computed(() =>
  filteredPickerProducts.value.slice(pickerPageFirst.value, pickerPageFirst.value + pickerPageSize),
)

function togglePickerExpand(id: number): void {
  const i = pickerExpanded.value.indexOf(id)
  i === -1 ? pickerExpanded.value.push(id) : pickerExpanded.value.splice(i, 1)
}
</script>
