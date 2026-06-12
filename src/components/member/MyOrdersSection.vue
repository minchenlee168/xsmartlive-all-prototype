<script setup lang="ts">
import { computed, ref } from 'vue'
import { useViewportStore } from '../../stores/viewport'

/**
 * 我的訂單 section（會員中心右側內容）。
 * 對齊 Figma 8845:44643：
 * - 上方「購物權益與售後說明」可收合面板
 * - 標題 + 7 個 tab + 日期區間 + 搜尋 + 查詢結果摘要
 * - 訂單卡（header table + 子 tab + 商品列 + timeline）
 * - 下方「配送、退款與發票說明」可收合面板
 */

const vp = computed(() => useViewportStore().current.id)
const isMobile = computed(() => vp.value === 'mobile')

// 上下兩個說明面板狀態
const topInfoOpen = ref(false)
const bottomInfoOpen = ref(false)

// 主 tab
type StatusTab = 'all' | 'unpaid' | 'to_ship' | 'to_receive' | 'to_complete' | 'cancelled' | 'returned'
const statusTabs: Array<{ key: StatusTab; label: string }> = [
  { key: 'all',          label: '所有訂單' },
  { key: 'unpaid',       label: '待付款' },
  { key: 'to_ship',      label: '待出貨' },
  { key: 'to_receive',   label: '待收貨' },
  { key: 'to_complete',  label: '待完成' },
  { key: 'cancelled',    label: '取消' },
  { key: 'returned',     label: '退貨/退款' },
]
const activeTab = ref<StatusTab>('all')

// 日期 / 搜尋
const dateRange = ref<Array<Date | null>>([new Date('2026-01-06'), new Date('2026-02-04')])
const keyword = ref('')

// 商品列子 tab
type DetailTab = 'progress' | 'returns' | 'exchange' | 'order' | 'changes' | 'payment'
const detailTabs: Array<{ key: DetailTab; label: string }> = [
  { key: 'progress', label: '配送進度/明細' },
  { key: 'returns',  label: '退貨明細' },
  { key: 'exchange', label: '換貨' },
  { key: 'order',    label: '訂單明細' },
  { key: 'changes',  label: '變更紀錄' },
  { key: 'payment',  label: '訂單/付款資訊' },
]

// Timeline 階段
interface TimelineStep {
  key: 'unpaid' | 'to_ship' | 'shipping' | 'to_receive' | 'delivered' | 'completed'
  label: string
  time?: string
}
const TIMELINE_STEPS: Array<{ key: TimelineStep['key']; label: string }> = [
  { key: 'unpaid',     label: '待付款' },
  { key: 'to_ship',    label: '待出貨' },
  { key: 'shipping',   label: '出貨中' },
  { key: 'to_receive', label: '待收貨' },
  { key: 'delivered',  label: '已送達' },
  { key: 'completed',  label: '已完成' },
]

// Order mock
interface OrderItem {
  image?: string
  name: string
  spec: string
  price: number
  qty: number
  /** 該商品目前所在的 timeline 階段（含），之前的視為已完成 */
  currentStep: TimelineStep['key']
  waybillNo?: string
  /** 階段對應時間，key 為 step key */
  stepTimes?: Partial<Record<TimelineStep['key'], string>>
}
interface OrderRecord {
  id: string
  date: string
  orderNo: string
  qty: number
  total: number
  payment: string
  delivery: string
  invoice: string
  status: 'unpaid' | 'to_ship' | 'to_receive' | 'to_complete' | 'cancelled' | 'returned'
  detailTab: DetailTab
  items: OrderItem[]
}

const orders = ref<OrderRecord[]>([
  {
    id: '1',
    date: '2026/02/01 08:26',
    orderNo: '1000000010',
    qty: 4,
    total: 600,
    payment: '線上刷卡',
    delivery: '宅配',
    invoice: '線上列印',
    status: 'unpaid',
    detailTab: 'progress',
    items: [
      {
        image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=400&fit=crop',
        name: '秋裝長袖公主風包屁衣 秋裝長袖公主風包屁衣（早晨起暖一行會顯示點點點...）',
        spec: '顏色：紅色 / 尺寸：60cm',
        price: 450,
        qty: 3,
        currentStep: 'unpaid',
        stepTimes: { unpaid: '02/01 07:20' },
      },
      {
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&fit=crop',
        name: '愛兒抗 UV 玻璃帽',
        spec: '尺寸：F',
        price: 150,
        qty: 1,
        currentStep: 'unpaid',
        stepTimes: { unpaid: '02/01 07:20' },
      },
    ],
  },
  {
    id: '2',
    date: '2026/02/01 08:26',
    orderNo: '1000000010',
    qty: 4,
    total: 600,
    payment: '線上刷卡',
    delivery: '宅配',
    invoice: '線上列印',
    status: 'to_ship',
    detailTab: 'progress',
    items: [
      {
        image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=400&fit=crop',
        name: '秋裝長袖公主風包屁衣 秋裝長袖公主風包屁衣（星星起暖一行會顯示點點點...）',
        spec: '顏色：紅色 / 尺寸：60cm',
        price: 450,
        qty: 3,
        currentStep: 'shipping',
        waybillNo: 'F1029322001',
        stepTimes: { unpaid: '02/01 07:20', to_ship: '02/01 08:00', shipping: '02/01 09:30' },
      },
      {
        image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&fit=crop',
        name: '愛兒抗 UV 玻璃帽',
        spec: '尺寸：F',
        price: 150,
        qty: 1,
        currentStep: 'shipping',
        waybillNo: 'F1029322011',
        stepTimes: { unpaid: '02/01 07:20', to_ship: '02/01 08:00', shipping: '02/01 09:30' },
      },
    ],
  },
])

const filteredOrders = computed(() => {
  let list = orders.value
  if (activeTab.value !== 'all') list = list.filter(o => o.status === activeTab.value)
  if (keyword.value.trim()) {
    const k = keyword.value.trim().toLowerCase()
    list = list.filter(o =>
      o.orderNo.includes(k)
      || o.items.some(it => it.name.toLowerCase().includes(k)),
    )
  }
  return list
})

function stepStatus(item: OrderItem, stepKey: TimelineStep['key']): 'done' | 'current' | 'pending' {
  const order = TIMELINE_STEPS.findIndex(s => s.key === item.currentStep)
  const idx = TIMELINE_STEPS.findIndex(s => s.key === stepKey)
  if (idx < order) return 'done'
  if (idx === order) return 'current'
  return 'pending'
}

/** 訂單狀態：取商品中「最早未完成」的階段；全部 completed → 已完成。 */
function orderDisplayStatus(order: OrderRecord): string {
  const minIdx = order.items.reduce((m, it) => {
    const idx = TIMELINE_STEPS.findIndex(s => s.key === it.currentStep)
    return Math.min(m, idx === -1 ? TIMELINE_STEPS.length : idx)
  }, TIMELINE_STEPS.length)
  return TIMELINE_STEPS[Math.min(minIdx, TIMELINE_STEPS.length - 1)]?.label ?? '—'
}

/** 手機版狀態 chip：根據 currentStep 給對應 icon。 */
function stepIcon(key: TimelineStep['key']): string {
  const map: Record<TimelineStep['key'], string> = {
    unpaid:     'pi-credit-card',
    to_ship:    'pi-box',
    shipping:   'pi-truck',
    to_receive: 'pi-inbox',
    delivered:  'pi-check-circle',
    completed:  'pi-verified',
  }
  return map[key] ?? 'pi-circle'
}

/** 進度條百分比：currentStep 在 timeline 的位置 / (總數 - 1)。 */
function stepProgressPct(key: TimelineStep['key']): number {
  const idx = TIMELINE_STEPS.findIndex(s => s.key === key)
  if (idx === -1) return 0
  return Math.round((idx / (TIMELINE_STEPS.length - 1)) * 100)
}
function stepIndex(key: TimelineStep['key']): number {
  return TIMELINE_STEPS.findIndex(s => s.key === key) + 1
}

function formatDateRange(): string {
  const [a, b] = dateRange.value
  const fmt = (d: Date | null) => d ? `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}` : '—'
  return `${fmt(a)} - ${fmt(b)}`
}
</script>

<template>
  <div class="flex flex-col gap-4">

    <!-- 上方：購物權益與售後說明 -->
    <Panel
      header="購物權益與售後說明"
      toggleable
      :collapsed="!topInfoOpen"
      :pt="{
        header: { style: 'background: var(--p-primary-50); border-radius: 8px 8px 0 0; padding: 12px 16px' },
        title: { style: 'font-size: 14px; font-weight: 600; color: var(--primary)' },
        content: { style: 'padding: 14px 16px; font-size: 12.5px; line-height: 1.7; color: #475569' },
      }"
      @update:collapsed="(v) => topInfoOpen = !v"
    >
      <p class="mb-2">
        產品均享有10天猶豫期之權益(注意！猶豫期非試用期)，若退/換回產品非全新狀態且包裝完整，將影響您的退貨權益及需負擔回復原狀責任。
      </p>
      <p class="mb-2">
        ※ 依「通訊交易解除權合理例外情事適用準則」，5類商品無10天猶豫期，請參閱商品退貨需知。部分特殊商品不適用十天猶豫期之規定。
      </p>
      <p class="mb-2">
        下載版序號、珠寶、黃金類、含安裝家電訂單之商品暫不提供線上退/換貨，3C類商品暫不提供換貨服務，其它商品僅限換貨1次。
      </p>
      <p class="mb-2">
        若無法線上操作，請您利用聯絡客服功能，將有專人盡速為您處理。
      </p>
      <p class="font-bold text-[#334155] mt-3">退/換貨規範：</p>
      <p>群組促銷商品(例：單品任選、滿件、滿額等...)屬單一商品，須和同單其他商品一同取消、退貨。限定配送狀態為『已送達』，且為同一品號之商品，方可進行換貨服務。</p>
    </Panel>

    <!-- 標題 -->
    <h2 class="text-2xl font-bold text-[#020617]">我的訂單</h2>

    <!-- Tab list -->
    <div class="border-b border-[#e2e8f0]">
      <div class="flex items-center gap-1 overflow-x-auto scrollbar-none">
        <button
          v-for="t in statusTabs"
          :key="t.key"
          class="px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap -mb-px border-b-2"
          :style="activeTab === t.key
            ? 'color: var(--primary); border-color: var(--primary)'
            : 'color: #64748b; border-color: transparent'"
          @click="activeTab = t.key"
        >{{ t.label }}</button>
      </div>
    </div>

    <!-- 日期 + 搜尋 -->
    <div class="flex gap-3" :class="isMobile ? 'flex-col' : 'flex-row items-center'">
      <div class="flex flex-col gap-1.5" :class="isMobile ? 'w-full' : 'w-[420px]'">
        <span class="text-sm font-medium text-[#334155]">訂單日期</span>
        <DatePicker
          v-model="dateRange"
          selection-mode="range"
          show-icon
          date-format="yy/mm/dd"
          placeholder="YYYY/MM/DD - YYYY/MM/DD"
          class="w-full"
        />
      </div>
      <div class="flex-1 flex flex-col gap-1.5">
        <span class="text-sm font-medium text-[#334155]">&nbsp;</span>
        <InputGroup>
          <InputText v-model="keyword" placeholder="請輸入訂單ID或商品名稱" />
          <Button label="查詢" />
        </InputGroup>
      </div>
    </div>

    <!-- 結果摘要 -->
    <p class="text-sm text-[#64748b]">
      你的查詢結果是
      <span class="font-medium text-[#334155]">{{ formatDateRange() }}</span>
      共找到
      <span class="font-bold" style="color: var(--primary)">{{ filteredOrders.length }}</span>
      筆訂單
    </p>

    <!-- 訂單卡列表 -->
    <div class="flex flex-col gap-5">
      <article
        v-for="order in filteredOrders"
        :key="order.id"
        class="border border-[#e2e8f0] rounded-[8px] overflow-hidden bg-white"
      >
        <!-- Header table -->
        <div
          class="grid items-center text-sm"
          :class="isMobile ? 'grid-cols-2 gap-y-2 p-3' : 'grid-cols-[1.4fr_1.4fr_0.6fr_0.8fr_0.9fr_0.7fr_0.9fr_1fr] gap-x-3 px-4 py-3'"
          style="background: color-mix(in srgb, var(--primary) 8%, transparent)"
        >
          <div>
            <p class="text-xs text-[#64748b]">訂單日期</p>
            <p class="text-[#334155] font-medium">{{ order.date }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b]">訂單編號</p>
            <p class="text-[#334155] font-medium">{{ order.orderNo }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b]">數量</p>
            <p class="text-[#334155] font-medium">{{ order.qty }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b]">訂單總額</p>
            <p class="font-bold" style="color: var(--primary)">${{ order.total }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b]">付款方式</p>
            <p class="text-[#334155] font-medium">{{ order.payment }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b]">配送方式</p>
            <p class="text-[#334155] font-medium">{{ order.delivery }}</p>
          </div>
          <div>
            <p class="text-xs text-[#64748b]">發票</p>
            <Button label="線上列印" icon="pi pi-print" size="small" class="!py-1" />
          </div>
          <div>
            <p class="text-xs text-[#64748b]">狀態</p>
            <p class="font-medium" style="color: var(--primary)">{{ orderDisplayStatus(order) }}</p>
          </div>
        </div>

        <!-- 子 tab：手機改用 Select 下拉、其他用橫式 tabs -->
        <div class="border-b border-[#e2e8f0]">
          <div v-if="isMobile" class="px-3 py-2">
            <Select
              v-model="order.detailTab"
              :options="detailTabs"
              option-label="label"
              option-value="key"
              class="w-full"
            />
          </div>
          <div v-else class="overflow-x-auto scrollbar-none">
            <div class="flex items-center gap-1 px-2">
              <button
                v-for="dt in detailTabs"
                :key="dt.key"
                class="px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap -mb-px border-b-2"
                :style="order.detailTab === dt.key
                  ? 'color: var(--primary); border-color: var(--primary)'
                  : 'color: #64748b; border-color: transparent'"
                @click="order.detailTab = dt.key"
              >{{ dt.label }}</button>
            </div>
          </div>
        </div>

        <!-- 商品列 + Timeline -->
        <div class="flex flex-col">
          <div
            v-for="(item, ii) in order.items"
            :key="ii"
            class="px-4 py-4"
            :class="ii !== order.items.length - 1 ? 'border-b border-[#f1f5f9]' : ''"
          >
            <!-- 商品 row -->
            <div class="flex items-start gap-3 mb-4">
              <div class="w-[60px] h-[60px] rounded-[6px] overflow-hidden bg-[#f1f5f9] shrink-0">
                <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-[#334155] line-clamp-2 leading-snug">{{ item.name }}</p>
                <p class="text-xs text-[#64748b] mt-1">規格：{{ item.spec }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-sm font-bold" style="color: var(--primary)">${{ item.price.toLocaleString() }}</p>
                <p class="text-xs text-[#64748b] mt-0.5">/{{ item.qty }}件</p>
              </div>
            </div>

            <!-- Waybill（出貨後才有） -->
            <div v-if="item.waybillNo" class="flex items-center gap-2 mb-2 pl-[72px]">
              <span class="text-xs text-[#64748b]">包裹編碼：</span>
              <span class="text-xs font-medium text-[#334155]">{{ item.waybillNo }}</span>
              <a class="text-xs hover:underline" style="color: var(--primary)">(查看配送進度)</a>
            </div>

            <!-- Timeline：手機緊湊版（icon + 當前狀態 + 進度條，蝦皮/MOMO 風格） -->
            <div v-if="isMobile" class="rounded-md p-3" style="background: var(--p-primary-50)">
              <div class="flex items-center justify-between gap-3 mb-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <span
                    class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white"
                    style="background: var(--primary)"
                  >
                    <i :class="`pi ${stepIcon(item.currentStep)}`" style="font-size: 14px"></i>
                  </span>
                  <div class="min-w-0">
                    <p class="text-sm font-bold leading-tight" style="color: var(--primary)">
                      {{ TIMELINE_STEPS.find(s => s.key === item.currentStep)?.label ?? '—' }}
                    </p>
                    <p class="text-xs text-[#64748b] leading-tight mt-0.5">
                      {{ item.stepTimes?.[item.currentStep] ?? '—' }}
                    </p>
                  </div>
                </div>
                <span class="text-xs font-bold shrink-0" style="color: var(--primary)">
                  {{ stepIndex(item.currentStep) }} / {{ TIMELINE_STEPS.length }}
                </span>
              </div>
              <!-- 進度條 -->
              <div class="h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all"
                  :style="{ width: stepProgressPct(item.currentStep) + '%', background: 'var(--primary)' }"
                ></div>
              </div>
            </div>

            <!-- Timeline：非手機橫式 -->
            <div v-else class="overflow-x-auto scrollbar-none">
              <div class="flex items-start min-w-[640px] pl-[72px]">
                <template v-for="(step, si) in TIMELINE_STEPS" :key="step.key">
                  <div class="flex flex-col items-center gap-1.5 shrink-0" style="min-width: 88px">
                    <span
                      class="w-5 h-5 rounded-full flex items-center justify-center"
                      :style="stepStatus(item, step.key) === 'done'
                        ? 'background: var(--primary); color: white'
                        : stepStatus(item, step.key) === 'current'
                          ? 'background: var(--primary); color: white; box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 20%, transparent)'
                          : 'background: #e2e8f0; color: #94a3b8'"
                    >
                      <i v-if="stepStatus(item, step.key) === 'done'" class="pi pi-check" style="font-size: 10px"></i>
                      <span v-else class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    </span>
                    <p
                      class="text-xs font-medium"
                      :style="stepStatus(item, step.key) === 'pending' ? 'color: #94a3b8' : 'color: var(--primary)'"
                    >{{ step.label }}</p>
                    <p
                      class="text-[11px]"
                      :style="stepStatus(item, step.key) === 'pending' ? 'color: #cbd5e1' : 'color: #64748b'"
                    >{{ item.stepTimes?.[step.key] ?? '—' }}</p>
                  </div>
                  <span
                    v-if="si !== TIMELINE_STEPS.length - 1"
                    class="flex-1 h-px mt-2.5"
                    :style="stepStatus(item, TIMELINE_STEPS[si + 1].key) === 'pending'
                      ? 'background: #e2e8f0'
                      : 'background: var(--primary)'"
                  ></span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div v-if="filteredOrders.length === 0" class="text-center py-12 text-[#64748b] text-sm">
        此分類目前沒有訂單
      </div>
    </div>

    <!-- 下方：配送、退款與發票說明 -->
    <Panel
      header="配送、退款與發票說明"
      toggleable
      :collapsed="!bottomInfoOpen"
      :pt="{
        header: { style: 'background: var(--p-primary-50); border-radius: 8px 8px 0 0; padding: 12px 16px' },
        title: { style: 'font-size: 14px; font-weight: 600; color: var(--primary)' },
        content: { style: 'padding: 14px 16px; font-size: 12.5px; line-height: 1.7; color: #475569' },
      }"
      @update:collapsed="(v) => bottomInfoOpen = !v"
    >
      <p class="mb-2">
        ※ 食品因有保存期限問題，一經拆封食用後，將會影響退貨權限。
      </p>
      <p class="mb-2">
        ※ 商品請保持完整(含主商品、配件、贈品與原廠外箱)，若有缺件、毀損等個人因素，將保留接受退換貨與否之權力。
      </p>
      <p class="mb-2">
        ※ 若商品已過猶豫期限，則無法線上申請銷退。
      </p>
      <p class="font-bold text-[#334155] mt-3">相關事項說明：</p>
      <p class="mb-2">
        &lt; 配送服務 &gt; 除特殊商品外(如:材積過大等)須另行約定送貨時間外，其餘商品皆如網頁中所查詢的配送進度中顯示之日期進行配送。
      </p>
      <p class="mb-2">
        &lt; 折價券 &gt; 折價券使用後，若取消訂單或辦理退貨時，折價券仍在有效期限內，將歸還至會員帳戶；若折價券已過期，則失效無法再次使用。
      </p>
      <p class="mb-2">
        &lt; 退款方式 &gt; 付款方式為貨到付款、超商取貨付款、IBON付款及ATM付款之訂單，確認退貨後將款項以匯款方式退還訂購人。付款方式為信用卡者，確認退貨方式將款項退至原信用卡帳戶中。
      </p>
      <p class="font-bold text-[#334155] mt-3">關於發票開立與寄送：</p>
      <p class="mb-2">
        &lt; 個人發票 &gt; 本公司已全面採用電子發票，客戶購買商品並於付款完成、商品出貨後，將所開立的發票以 E-mail 方式通知客戶。
      </p>
      <p class="mb-2">
        &lt; 法人發票 &gt; 訂購時選擇「公司用發票(線上列印)」者，您可於發票開立後點選訂單查詢頁面，可直接下載列印「電子發票證明聯」作為報帳使用。
      </p>
      <p class="text-xs text-[#94a3b8] mt-3">
        ※若有任何問題，歡迎您隨時利用網站 FAQ/連絡客服留下您要詢問的問題，將有專人為您服務。
      </p>
    </Panel>

  </div>
</template>
