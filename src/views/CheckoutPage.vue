<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import CategoryTabs from '../components/CategoryTabs.vue'
import { products } from '../data/products'
import { useViewportStore } from '../stores/viewport'
import { useUiStore } from '../stores/ui'
import { useCartStore } from '../stores/cart'

const viewportStore = useViewportStore()
const drawerWidth = computed(() => `${viewportStore.current.width ?? 1280}px`)

const router = useRouter()
const ui = useUiStore()
const cartStore = useCartStore()

function placeOrder() {
  cartStore.groups = []
  ui.toast('訂單已成立，感謝您的購買！')
  router.push('/')
}

interface SubItem { name: string; image?: string; spec: string; qty: number }
interface Item {
  id: string
  name: string
  image?: string
  spec: string[]
  qty: number
  price: number
  bundleItems?: SubItem[]
}
interface Group {
  id: number
  sellerName: string
  items: Item[]
}

const groups: Group[] = [
  {
    id: 1,
    sellerName: '春節服飾好禮直播連線',
    items: [
      {
        id: 'c1', name: '秋冬優惠三件組（若是超過一行會顯示點點點）',
        image: products.find(p => p.id === 13)?.image,
        spec: ['新款 秋冬慵懶軟糯毛衣 吊帶連衣裙套裝(外套) S/黑x1', '新款 秋冬慵懶軟糯毛衣 吊帶連衣裙套裝(外套) S/黑x1'],
        qty: 1, price: 688,
        bundleItems: [
          { name: '新款 秋冬慵懶軟糯毛衣 吊帶連衣裙套裝(外套) S/黑x1', image: products.find(p => p.id === 3)?.image, spec: 'S/黑', qty: 1 },
          { name: '新款 秋冬慵懶軟糯毛衣 吊帶連衣裙套裝(外套) S/黑x1', image: products.find(p => p.id === 7)?.image, spec: 'S/黑', qty: 1 },
          { name: '新款 秋冬慵懶軟糯毛衣 吊帶連衣裙套裝(外套) S/黑x1', image: products.find(p => p.id === 1)?.image, spec: 'S/黑', qty: 1 },
        ],
      },
      {
        id: 'c2', name: '秋裝長袖公主南瓜系包屁衣 秋裝長袖公主南瓜系包屁衣（若…',
        image: products.find(p => p.id === 1)?.image,
        spec: ['80cm,橘'], qty: 1, price: 688,
      },
      {
        id: 'c3', name: '限量 MM巧克力男寶寶搞怪包屁衣（若是超過一行會顯示點…',
        image: products.find(p => p.id === 7)?.image,
        spec: ['66cm,藍色'], qty: 1, price: 300,
      },
    ],
  },
  {
    id: 2,
    sellerName: '兒童大廠清倉',
    items: [
      {
        id: 'c4', name: '新款組合 包屁衣韓版小洋裝雙件組',
        image: products.find(p => p.id === 13)?.image,
        spec: ['66cm'], qty: 1, price: 300,
        bundleItems: [
          { name: '新款 包屁衣韓版小洋裝 黑x1', image: products.find(p => p.id === 3)?.image, spec: '黑', qty: 1 },
          { name: '新款 包屁衣韓版小洋裝 白x1', image: products.find(p => p.id === 7)?.image, spec: '白', qty: 1 },
        ],
      },
    ],
  },
]

const expandedBundles = ref<Record<string, boolean>>({ c1: true, c4: true })
function toggleBundle(id: string) { expandedBundles.value[id] = !expandedBundles.value[id] }

const groupSubtotal = (g: Group) => g.items.reduce((s, i) => s + i.price * i.qty, 0)

// Form state
const couponCode = ref('')
const couponApplied = ref(true)
const invoiceCarrierType = ref('member-email')
const invoiceEmail = ref('abc@gmail.com')

// --- Coupon drawer ---
interface Coupon {
  id: string
  amount: string          // '折300' | '90%'
  title: string
  desc: string
  scope: string
  expiry: string
  disabled?: boolean
  disabledReason?: string
}
const coupons = ref<Coupon[]>([
  { id: 'cp1', amount: '折300', title: '滿千折百優惠券（滿1000元使用）', desc: '活動訂單滿 $1000 現折 $300', scope: '適用範圍（直播場次）：我是直播場次-2025-12-24', expiry: '有效期限至 2026.01.20 23:00' },
  { id: 'cp2', amount: '90%', title: '滿千五折（滿1000元使用）', desc: '活動訂單滿 $5000 打9折', scope: '適用範圍(粉絲團貼文)：我是粉絲團貼文-2025-12-24', expiry: '有效期限至 2026.01.20 23:00' },
  { id: 'cp3', amount: '折300', title: '滿三千折三百（滿3000元使用）', desc: '常客單筆滿 $3000 現折 $300', scope: '適用範圍：全站', expiry: '有效期限至 2026.01.20 23:00', disabled: true, disabledReason: '金額未達門檻' },
])
const couponDrawerOpen = ref(false)
const couponDrawerSelected = ref<string | null>('cp1')
function openCouponDrawer() {
  couponDrawerSelected.value = coupons.value.find(c => !c.disabled)?.id ?? null
  couponDrawerOpen.value = true
}
function confirmCouponDrawer() {
  couponDrawerOpen.value = false
  showToast('已套用選擇的優惠券')
}

// --- Toast ---
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | null = null
function showToast(msg: string) {
  toastMessage.value = msg
  toastVisible.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 3000)
}
function applyCouponCode() {
  if (!couponCode.value.trim()) return
  showToast('已套用選擇的優惠券')
}

// --- Shipping drawer ---
interface HomeAddress { id: string; name: string; phone: string; address: string; isDefault: boolean; unavailable?: boolean }
interface StoreAddress { id: string; name: string; phone: string; chain: '7-11' | 'FamilyMart'; storeName: string; address: string; isDefault: boolean }

type ShipDrawerView = 'list' | 'add-home' | 'add-store'
type ShipMethod = 'home' | 'store' | null

const shipDrawerOpen = ref(false)
const shipDrawerView = ref<ShipDrawerView>('list')
const shipMethod = ref<ShipMethod>('home')
const homeAddresses = ref<HomeAddress[]>([
  { id: 'h1', name: '王小明', phone: '+886 912****56', address: '台北市信義區忠孝東路五段 100 號 10 樓', isDefault: true },
  { id: 'h2', name: '王小明', phone: '+886 912****56', address: '高雄市前鎮區中山路一段 50 號 8 樓', isDefault: false, unavailable: true },
])
const storeAddresses = ref<StoreAddress[]>([
  { id: 's1', name: '王小明', phone: '+886 912****56', chain: '7-11', storeName: '雄鎮門市', address: '806高雄市前鎮區東一街7號', isDefault: true },
  { id: 's2', name: '王小明', phone: '+886 912****56', chain: 'FamilyMart', storeName: '平鎮上海店', address: '324桃園市平鎮區上海路205號', isDefault: false },
])
const selectedHomeId = ref<string | null>('h1')
const selectedStoreId = ref<string | null>('s1')

function openShipDrawer() {
  shipDrawerView.value = 'list'
  shipDrawerOpen.value = true
}
function setDefaultHome(id: string) {
  homeAddresses.value.forEach(a => { a.isDefault = a.id === id })
}
function setDefaultStore(id: string) {
  storeAddresses.value.forEach(a => { a.isDefault = a.id === id })
}
function deleteHome(id: string) {
  const wasDefault = homeAddresses.value.find(a => a.id === id)?.isDefault
  homeAddresses.value = homeAddresses.value.filter(a => a.id !== id)
  if (wasDefault && homeAddresses.value.length > 0 && !homeAddresses.value.some(a => a.isDefault)) {
    homeAddresses.value[0].isDefault = true
  }
  if (selectedHomeId.value === id) selectedHomeId.value = homeAddresses.value[0]?.id ?? null
}
function deleteStore(id: string) {
  const wasDefault = storeAddresses.value.find(a => a.id === id)?.isDefault
  storeAddresses.value = storeAddresses.value.filter(a => a.id !== id)
  if (wasDefault && storeAddresses.value.length > 0 && !storeAddresses.value.some(a => a.isDefault)) {
    storeAddresses.value[0].isDefault = true
  }
  if (selectedStoreId.value === id) selectedStoreId.value = storeAddresses.value[0]?.id ?? null
}

// Add-home form
const newHomeName = ref('')
const newHomeCountryCode = ref('+886')
const newHomePhone = ref('')
const newHomeCountry = ref('台灣')
const newHomeCity = ref('高雄市')
const newHomeDistrict = ref('前鎮區')
const newHomeAddress = ref('')
function resetAddHomeForm() {
  newHomeName.value = ''
  newHomePhone.value = ''
  newHomeAddress.value = ''
}
function submitAddHome() {
  if (!newHomeName.value.trim()) return
  homeAddresses.value.push({
    id: 'h' + (homeAddresses.value.length + 1),
    name: newHomeName.value,
    phone: `${newHomeCountryCode.value} ${newHomePhone.value || '000****00'}`,
    address: `${newHomeCity.value}${newHomeDistrict.value} ${newHomeAddress.value}`,
    isDefault: false,
  })
  resetAddHomeForm()
  shipDrawerView.value = 'list'
}

// Add-store form
const newStoreChain = ref<'7-11' | 'FamilyMart' | null>(null)
const newStoreName = ref('王小明')
const newStorePhone = ref('09123456')
const pickedStoreName = ref('')
const pickedStoreAddr = ref('')
function pickChain(c: '7-11' | 'FamilyMart') {
  newStoreChain.value = c
  // mock: simulate map picker
  if (c === '7-11') { pickedStoreName.value = '7-11 鑫工門市'; pickedStoreAddr.value = '台北市信義區忠孝東路五段 100 號 10 樓' }
  else { pickedStoreName.value = '全家 上海店'; pickedStoreAddr.value = '324桃園市平鎮區上海路205號' }
}
function resetAddStoreForm() {
  newStoreChain.value = null
  pickedStoreName.value = ''
  pickedStoreAddr.value = ''
}
function submitAddStore() {
  if (!newStoreChain.value || !pickedStoreName.value) return
  storeAddresses.value.push({
    id: 's' + (storeAddresses.value.length + 1),
    name: newStoreName.value,
    phone: `+886 ${newStorePhone.value.replace(/(\d{3})\d+(\d{2})/, '$1****$2')}`,
    chain: newStoreChain.value,
    storeName: pickedStoreName.value,
    address: pickedStoreAddr.value,
    isDefault: false,
  })
  resetAddStoreForm()
  shipDrawerView.value = 'list'
}

const shippingFee = computed(() => {
  if (shipMethod.value === 'home') return 150
  if (shipMethod.value === 'store') return 60
  return 0
})
const shippingMethodLabel = computed(() => {
  if (shipMethod.value === 'home') return '宅配'
  if (shipMethod.value === 'store') return '超商配送'
  return '請選擇'
})
const selectedHome = computed(() => homeAddresses.value.find(a => a.id === selectedHomeId.value))
const selectedStore = computed(() => storeAddresses.value.find(a => a.id === selectedStoreId.value))
const rewardPoints = ref('')
const shoppingCredit = ref('')
const paymentMethod = ref('credit')

// Money breakdown (mock)
const productTotal = 1976
const shippingTotal = computed(() => shippingFee.value + 100) // 100 = other group fee
const multiItemDiscount = -100
const shippingDiscount = -200
const couponDiscount = -100
const rewardPointsNum = computed(() => Math.max(0, Number(rewardPoints.value) || 0))
const shoppingCreditNum = computed(() => Math.max(0, Number(shoppingCredit.value) || 0))
const finalTotal = computed(() =>
  productTotal + shippingTotal.value + multiItemDiscount + shippingDiscount + couponDiscount
  - rewardPointsNum.value - shoppingCreditNum.value
)
const totalSaved = computed(() =>
  Math.abs(multiItemDiscount + shippingDiscount + couponDiscount) + rewardPointsNum.value + shoppingCreditNum.value
)
</script>

<template>
  <div class="min-h-screen flex flex-col" style="background: var(--page-bg)">
    <NavBar />
    <CategoryTabs />

    <!-- Page header -->
    <div>
      <div class="max-w-[1280px] mx-auto px-4 py-[22px] flex items-center gap-3">
        <button
          class="flex items-center justify-center w-8 h-8 rounded-[6px] hover:bg-gray-100 text-[#334155] transition-colors"
          @click="router.back()"
        >
          <i class="pi pi-arrow-left text-sm" />
        </button>
        <h1 class="font-bold text-[#020617] text-2xl">結帳</h1>
      </div>
    </div>

    <main class="flex-1 max-w-[1280px] w-full mx-auto flex flex-col" style="padding: var(--page-pad-y) var(--page-pad-x) 120px; gap: var(--stack-gap)">
      <!-- Coupon -->
      <section class="bg-white rounded-[12px] shadow-card card-pad flex items-center justify-between gap-4 flex-wrap">
        <span class="font-medium text-[#334155]">優惠券</span>
        <div class="flex items-center gap-3 flex-wrap">
          <span class="flex items-center gap-1.5 text-sm" style="color: #16a34a">
            <i class="pi pi-check-circle" />
            已套用『滿千折百』優惠券
          </span>
          <button
            class="px-[14px] py-[8px] rounded-[6px] text-white text-sm font-medium"
            style="background: var(--primary-bg)"
            @click="openCouponDrawer"
          >
            選擇可使用優惠券
          </button>
          <div class="flex items-center">
            <input
              v-model="couponCode"
              type="text"
              placeholder="輸入優惠券優惠代碼"
              class="h-[36px] w-[200px] px-3 text-sm rounded-l-[6px] border border-[#cbd5e1] border-r-0 outline-none focus:border-[var(--primary)] transition-colors text-[#334155]"
              @keyup.enter="applyCouponCode"
            />
            <button
              class="h-[36px] px-4 rounded-r-[6px] border border-[#cbd5e1] text-sm font-medium text-[#334155] hover:bg-gray-50 transition-colors"
              @click="applyCouponCode"
            >
              使用
            </button>
          </div>
        </div>
      </section>

      <!-- Item groups -->
      <section
        v-for="group in groups"
        :key="group.id"
        class="bg-white rounded-[12px] shadow-card"
      >
        <div class="px-[16px] py-[10.5px]">
          <span class="font-medium text-[#334155]">{{ group.sellerName }}</span>
        </div>
        <div
          v-for="(item, ii) in group.items"
          :key="item.id"
          :class="ii !== group.items.length - 1 ? 'cart-divider' : ''"
        >
          <div class="flex items-start gap-4 px-[16px] py-[10.5px]">
            <div class="shrink-0 w-[80px] h-[80px] bg-[#d9d9d9] rounded-[4px] overflow-hidden">
              <img v-if="item.image" :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0 flex flex-col gap-1">
              <p class="font-semibold text-[16px] text-[#334155] truncate">{{ item.name }}</p>
              <div v-for="(s, si) in item.spec" :key="si" class="flex gap-4 text-[14px] text-[#334155]">
                <span class="shrink-0">規格</span>
                <span class="truncate">{{ s }}</span>
              </div>
              <div class="flex gap-4 text-[14px] text-[#334155]">
                <span>數量</span><span>{{ item.qty }}</span>
              </div>
            </div>
            <div class="shrink-0 text-right text-[#334155] font-medium">
              ${{ item.price.toLocaleString() }}
            </div>
          </div>

          <!-- Bundle -->
          <div v-if="item.bundleItems" class="px-[16px] pb-[16px] pl-[36px] pt-[15px]">
            <div class="relative border border-[#e2e8f0] rounded-[6px] bg-white pt-4 px-[16px] pb-[16px]">
              <button
                class="absolute border-0 rounded-[6px] px-[11.5px] py-[8px] flex items-center gap-[7px] text-[14px] font-black text-[#334155] transition-colors hover:text-[var(--primary)]"
                style="top: -17.75px; left: 15.75px; background: transparent"
                @click="toggleBundle(item.id)"
              >
                <i class="pi text-xs" :class="expandedBundles[item.id] ? 'pi-minus' : 'pi-plus'" />
                組合商品內容
              </button>
              <div v-if="expandedBundles[item.id]" class="flex flex-col gap-1 text-[14px] text-[#334155]">
                <span v-for="(sub, si) in item.bundleItems" :key="si">{{ sub.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="cart-divider-top flex items-center justify-end gap-4 px-[16px] py-[14px]">
          <span class="text-[14px] text-[#334155]">訂單金額小計 ({{ group.items.length }}個商品)</span>
          <span class="text-[24px] font-bold" style="color: var(--primary)">${{ groupSubtotal(group).toLocaleString() }}</span>
        </div>
      </section>

      <!-- 配送資訊 -->
      <section class="bg-white rounded-[12px] shadow-card overflow-hidden">
        <div class="px-[16px] py-[10.5px] cart-divider">
          <span class="font-medium text-[#334155]">配送資訊</span>
        </div>
        <div class="card-pad flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <span class="text-sm text-[#334155]">配送方式</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm text-[#334155]">{{ shippingMethodLabel }}</span>
            <button
              class="text-sm flex items-center gap-1"
              style="color: var(--primary)"
              @click="openShipDrawer"
            >
              選擇運送方式 <i class="pi pi-chevron-right text-[10px]" />
            </button>
          </div>
          <div class="text-sm text-[#334155] mt-1">配送地址</div>
          <div class="text-sm text-[#334155]" v-if="shipMethod === 'home' && selectedHome">
            {{ selectedHome.name }} {{ selectedHome.phone }} 　 地址: {{ selectedHome.address }}
          </div>
          <div class="text-sm text-[#334155]" v-else-if="shipMethod === 'store' && selectedStore">
            {{ selectedStore.name }} {{ selectedStore.phone }} 　 {{ selectedStore.chain }} {{ selectedStore.storeName }}（{{ selectedStore.address }}）
          </div>
          <div class="text-sm text-[#64748b]" v-else>尚未選擇配送地址</div>
        </div>
      </section>

      <!-- 發票資訊 -->
      <section class="bg-white rounded-[12px] shadow-card overflow-hidden">
        <div class="px-[16px] py-[10.5px] cart-divider">
          <span class="font-medium text-[#334155]">發票資訊</span>
        </div>
        <div class="card-pad flex flex-col gap-3 max-w-[440px]">
          <div class="flex flex-col gap-1">
            <label class="text-sm text-[#334155]">發票載具</label>
            <div class="relative">
              <select
                v-model="invoiceCarrierType"
                class="appearance-none w-full h-[36px] pl-3 pr-9 text-sm rounded-[6px] border border-[#cbd5e1] bg-white outline-none focus:border-[var(--primary)] transition-colors text-[#334155]"
              >
                <option value="member-email">會員載具（電子信箱）</option>
                <option value="mobile">手機條碼</option>
                <option value="natural">自然人憑證</option>
              </select>
              <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748b] pointer-events-none" />
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm text-[#334155]">Email</label>
            <input
              v-model="invoiceEmail"
              type="email"
              class="h-[36px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] transition-colors text-[#334155]"
            />
          </div>
        </div>
      </section>

      <!-- 金額折抵 -->
      <section class="bg-white rounded-[12px] shadow-card overflow-hidden">
        <div class="px-[16px] py-[10.5px] cart-divider">
          <span class="font-medium text-[#334155]">金額折抵</span>
        </div>
        <div class="card-pad flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-2 text-sm text-[#334155]">
            <span class="font-medium w-[60px]">紅利金</span>
            <span>使用</span>
            <div class="flex items-center">
              <span class="h-[32px] px-2 text-xs flex items-center bg-[#f1f5f9] rounded-l-[6px] border border-[#cbd5e1] border-r-0 text-[#64748b]">NT$</span>
              <input
                v-model="rewardPoints"
                type="number"
                class="qty-input h-[32px] w-[100px] px-2 text-sm border border-[#cbd5e1] rounded-r-[6px] outline-none focus:border-[var(--primary)] transition-colors text-[#334155]"
              />
            </div>
            <span>元</span>
            <span class="text-[#64748b]">/ 尚有紅利金 <span style="color: var(--primary)">$100</span> 元可使用</span>
          </div>
          <div class="flex flex-wrap items-center gap-2 text-sm text-[#334155]">
            <span class="font-medium w-[60px]">購物金</span>
            <span>使用</span>
            <div class="flex items-center">
              <span class="h-[32px] px-2 text-xs flex items-center bg-[#f1f5f9] rounded-l-[6px] border border-[#cbd5e1] border-r-0 text-[#64748b]">NT$</span>
              <input
                v-model="shoppingCredit"
                type="number"
                class="qty-input h-[32px] w-[100px] px-2 text-sm border border-[#cbd5e1] rounded-r-[6px] outline-none focus:border-[var(--primary)] transition-colors text-[#334155]"
              />
            </div>
            <span>元</span>
            <span class="text-[#64748b]">/ 尚有購物金 <span style="color: var(--primary)">$500</span> 元可使用</span>
          </div>
        </div>
      </section>

      <!-- 付款方式 -->
      <section class="bg-white rounded-[12px] shadow-card overflow-hidden">
        <div class="px-[16px] py-[10.5px] cart-divider">
          <span class="font-medium text-[#334155]">付款方式</span>
        </div>
        <div class="card-pad max-w-[440px]">
          <label class="text-sm text-[#334155] block mb-1">選擇付款方式</label>
          <div class="relative">
            <select
              v-model="paymentMethod"
              class="appearance-none w-full h-[36px] pl-3 pr-9 text-sm rounded-[6px] border border-[#cbd5e1] bg-white outline-none focus:border-[var(--primary)] transition-colors text-[#334155]"
            >
              <option value="credit">線上信用卡</option>
              <option value="atm">ATM 轉帳</option>
              <option value="cod">貨到付款</option>
            </select>
            <i class="pi pi-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748b] pointer-events-none" />
          </div>
        </div>
      </section>

      <!-- 金額明細 -->
      <section class="bg-white rounded-[12px] shadow-card overflow-hidden">
        <div class="card-pad grid grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-2 text-sm">
          <!-- 商品總金額 -->
          <div></div>
          <span class="text-[#334155]">商品總金額</span>
          <span class="text-[#334155] text-right min-w-[80px]">$ {{ productTotal.toLocaleString() }}</span>

          <!-- 運費總金額 -->
          <div></div>
          <span class="text-[#334155]">運費總金額</span>
          <span class="text-[#334155] text-right">$ {{ shippingTotal.toLocaleString() }}</span>

          <!-- 多件優惠折抵 -->
          <div></div>
          <span class="text-[#334155]">多件優惠折抵</span>
          <span class="text-right" style="color: #ef4444">- $ {{ Math.abs(multiItemDiscount).toLocaleString() }}</span>

          <!-- 符合「滿千免運」 + 運費折抵 -->
          <span class="justify-self-end flex items-center gap-1 text-[13px]" style="color: var(--primary)">
            <i class="pi pi-truck text-[12px]" />
            符合『滿千免運』
          </span>
          <span class="text-[#334155]">運費折抵</span>
          <span class="text-right" style="color: #ef4444">- $ {{ Math.abs(shippingDiscount).toLocaleString() }}</span>

          <!-- 已套用「滿千送百」 + 優惠券折扣 -->
          <span class="justify-self-end flex items-center gap-1 text-[13px]" style="color: var(--primary)">
            <i class="pi pi-ticket text-[12px]" />
            已套用『滿千送百』
          </span>
          <span class="text-[#334155]">優惠券折扣</span>
          <span class="text-right" style="color: #ef4444">- $ {{ Math.abs(couponDiscount).toLocaleString() }}</span>

          <!-- 紅利金 -->
          <template v-if="rewardPointsNum > 0">
            <div></div>
            <span class="text-[#334155]">紅利金折抵</span>
            <span class="text-right" style="color: #ef4444">- $ {{ rewardPointsNum.toLocaleString() }}</span>
          </template>

          <!-- 購物金 -->
          <template v-if="shoppingCreditNum > 0">
            <div></div>
            <span class="text-[#334155]">購物金折抵</span>
            <span class="text-right" style="color: #ef4444">- $ {{ shoppingCreditNum.toLocaleString() }}</span>
          </template>

          <!-- 總付款金額 -->
          <div></div>
          <span class="text-[#334155]">總付款金額</span>
          <span class="text-right font-medium" style="color: var(--primary)">$ {{ finalTotal.toLocaleString() }}</span>
        </div>
      </section>
    </main>

    <!-- Sticky footer -->
    <div class="sticky bottom-0 z-40 bg-white border-t border-b border-[#e2e8f0]">
      <div class="max-w-[1280px] mx-auto px-4 py-[18px] flex items-center justify-end gap-6">
        <div class="flex flex-col items-end leading-tight">
          <div class="flex items-baseline gap-4">
            <span class="text-[18px] text-[#334155]">總付款金額</span>
            <span class="text-[30px] font-bold" style="color: var(--primary)">${{ finalTotal.toLocaleString() }}</span>
          </div>
          <span class="text-sm" style="color: #ef4444">共省下 -${{ totalSaved.toLocaleString() }}</span>
        </div>
        <button
          class="px-16 py-[9.75px] rounded-[6px] text-white font-medium text-[15.75px] transition-colors"
          style="background: var(--primary-bg)"
          @mouseover="($event.currentTarget as HTMLElement).style.background = 'var(--primary-hover-bg)'"
          @mouseleave="($event.currentTarget as HTMLElement).style.background = 'var(--primary-bg)'"
          @click="placeOrder"
        >
          去付款
        </button>
      </div>
    </div>

    <!-- ============== Toast ============== -->
    <Transition name="toast">
      <div
        v-if="toastVisible"
        class="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-[#f0fdf4] border-2 border-[#16a34a] rounded-[8px] px-4 py-2 flex items-center gap-2 shadow-md min-w-[280px]"
      >
        <i class="pi pi-check text-[#16a34a]" />
        <div class="flex-1">
          <p class="text-sm font-bold text-[#16a34a]">成功</p>
          <p class="text-xs text-[#334155]">{{ toastMessage }}</p>
        </div>
        <button class="text-[#16a34a] hover:opacity-70" @click="toastVisible = false">
          <i class="pi pi-times text-xs" />
        </button>
      </div>
    </Transition>

    <!-- ============== Coupon Drawer ============== -->
    <Transition name="drawer-fade">
      <div v-if="couponDrawerOpen" class="drawer-backdrop" @click="couponDrawerOpen = false" />
    </Transition>
    <Transition name="drawer-slide">
      <div v-if="couponDrawerOpen" class="drawer-panel" :style="{ width: drawerWidth, maxWidth: '100vw' }">
        <div class="max-w-[1280px] mx-auto px-4 pt-5 pb-5">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-[18px] text-[#020617]">可使用優惠券</h3>
            <button class="text-[#334155] hover:opacity-70" @click="couponDrawerOpen = false">
              <i class="pi pi-times" />
            </button>
          </div>

          <!-- Coupon list -->
          <div class="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
            <label
              v-for="c in coupons"
              :key="c.id"
              class="flex border border-[#e2e8f0] rounded-[10px] overflow-hidden"
              :class="c.disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:border-[var(--primary)]'"
            >
              <!-- Amount block -->
              <div
                class="w-[180px] shrink-0 flex items-center gap-2 px-4 py-4"
                :style="c.disabled ? 'background: #f1f5f9' : 'background: #ede9fe'"
              >
                <i class="pi pi-gift text-[22px]" :style="c.disabled ? 'color: #94a3b8' : 'color: var(--primary)'" />
                <span class="font-bold text-[26px]" :style="c.disabled ? 'color: #94a3b8' : 'color: var(--primary)'">{{ c.amount }}</span>
              </div>
              <!-- Detail block -->
              <div class="flex-1 px-4 py-3 flex flex-col gap-1">
                <p class="font-medium text-[15px] text-[#334155]">{{ c.title }}</p>
                <p class="text-[13px] text-[#475569]">{{ c.desc }}</p>
                <span class="self-start px-2 py-0.5 rounded text-[12px]" style="background: #fce7f3; color: #be185d">{{ c.scope }}</span>
                <p class="text-[12px] text-[#64748b] mt-1">{{ c.expiry }}</p>
              </div>
              <!-- Right side: radio / disabled note -->
              <div class="w-[120px] shrink-0 flex items-center justify-center">
                <span v-if="c.disabled" class="text-[13px]" style="color: #ef4444">{{ c.disabledReason }}</span>
                <input
                  v-else
                  type="radio"
                  :value="c.id"
                  v-model="couponDrawerSelected"
                  class="w-5 h-5 accent-[var(--primary)] cursor-pointer"
                />
              </div>
            </label>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-2 mt-4">
            <button
              class="px-5 py-2 rounded-[6px] border border-[#cbd5e1] text-sm text-[#334155] hover:bg-gray-50 transition-colors"
              @click="couponDrawerOpen = false"
            >取消</button>
            <button
              class="px-5 py-2 rounded-[6px] text-white text-sm font-medium transition-colors"
              style="background: var(--primary-bg)"
              @click="confirmCouponDrawer"
            >確認</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ============== Shipping Drawer ============== -->
    <Transition name="drawer-fade">
      <div v-if="shipDrawerOpen" class="drawer-backdrop" @click="shipDrawerOpen = false" />
    </Transition>
    <Transition name="drawer-slide">
      <div v-if="shipDrawerOpen" class="drawer-panel" :style="{ width: drawerWidth, maxWidth: '100vw' }">
        <div class="max-w-[1280px] mx-auto px-4 pt-5 pb-5">

          <!-- ===== View: list ===== -->
          <template v-if="shipDrawerView === 'list'">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-[18px] text-[#020617]">選擇運送方式</h3>
              <button class="text-[#334155] hover:opacity-70" @click="shipDrawerOpen = false">
                <i class="pi pi-times" />
              </button>
            </div>

            <div class="flex flex-col gap-3 max-h-[60vh] overflow-y-auto">
              <!-- Home -->
              <div>
                <button
                  class="w-full flex items-center justify-between px-4 py-3 rounded-[6px]"
                  style="background: #f1f5f9"
                  @click="shipMethod = 'home'"
                >
                  <span class="text-[#334155] font-medium">宅配</span>
                  <span class="flex items-center gap-2 text-[#334155]">
                    $150
                    <i v-if="shipMethod === 'home'" class="pi pi-check" style="color: #16a34a" />
                  </span>
                </button>

                <div v-if="shipMethod === 'home'" class="mt-3 flex flex-col gap-2">
                  <div
                    v-for="addr in homeAddresses"
                    :key="addr.id"
                    class="flex items-start gap-3 px-2 py-2"
                  >
                    <input
                      type="radio"
                      :value="addr.id"
                      v-model="selectedHomeId"
                      class="mt-1 w-4 h-4 accent-[var(--primary)] cursor-pointer"
                      :disabled="addr.unavailable"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 text-sm text-[#334155]">
                        <span class="font-medium">{{ addr.name }}</span>
                        <span>{{ addr.phone }}</span>
                        <span v-if="addr.isDefault" class="px-1.5 py-0.5 rounded text-[11px] font-medium" style="background: var(--primary); color: white">預設</span>
                      </div>
                      <div class="text-sm text-[#334155] mt-1 flex items-center gap-1">
                        <i class="pi pi-map-marker text-xs" />
                        {{ addr.address }}
                        <span v-if="addr.unavailable" class="ml-1" style="color: #ef4444">(目前不提供配送至此地區)</span>
                      </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <button
                        v-if="!addr.isDefault"
                        class="px-3 py-1 rounded-[6px] border text-[12px] hover:bg-purple-50 transition-colors"
                        style="border-color: var(--primary); color: var(--primary)"
                        @click="setDefaultHome(addr.id)"
                      >設為預設</button>
                      <button
                        class="px-3 py-1 rounded-[6px] border text-[12px] hover:bg-red-50 transition-colors"
                        style="border-color: #ef4444; color: #ef4444"
                        @click="deleteHome(addr.id)"
                      >刪除</button>
                    </div>
                  </div>
                  <button
                    class="w-full px-4 py-2 rounded-[6px] border border-[#cbd5e1] text-sm text-[#334155] hover:bg-gray-50 transition-colors"
                    @click="shipDrawerView = 'add-home'"
                  >+ 新增宅配地址</button>
                </div>
              </div>

              <!-- Store -->
              <div>
                <button
                  class="w-full flex items-center justify-between px-4 py-3 rounded-[6px]"
                  style="background: #f1f5f9"
                  @click="shipMethod = 'store'"
                >
                  <span class="text-[#334155] font-medium">超商配送</span>
                  <span class="flex items-center gap-2 text-[#334155]">
                    $60
                    <i v-if="shipMethod === 'store'" class="pi pi-check" style="color: #16a34a" />
                  </span>
                </button>

                <div v-if="shipMethod === 'store'" class="mt-3 flex flex-col gap-2">
                  <div
                    v-for="addr in storeAddresses"
                    :key="addr.id"
                    class="flex items-start gap-3 px-2 py-2"
                  >
                    <input
                      type="radio"
                      :value="addr.id"
                      v-model="selectedStoreId"
                      class="mt-1 w-4 h-4 accent-[var(--primary)] cursor-pointer"
                    />
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 text-sm text-[#334155]">
                        <span class="font-medium">{{ addr.name }}</span>
                        <span>{{ addr.phone }}</span>
                        <span v-if="addr.isDefault" class="px-1.5 py-0.5 rounded text-[11px] font-medium" style="background: var(--primary); color: white">預設</span>
                      </div>
                      <div class="text-sm text-[#334155] mt-1 flex items-center gap-2">
                        <span
                          class="inline-flex items-center justify-center w-9 h-6 rounded text-white text-[10px] font-bold"
                          :style="addr.chain === '7-11' ? 'background: #ee1c25' : 'background: #00a040'"
                        >{{ addr.chain === '7-11' ? '7-11' : 'FAMI' }}</span>
                        <span class="font-medium">{{ addr.storeName }}</span>
                      </div>
                      <div class="text-sm text-[#334155] mt-1 flex items-center gap-1 ml-11">
                        <i class="pi pi-map-marker text-xs" />
                        {{ addr.address }}
                      </div>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                      <button
                        v-if="!addr.isDefault"
                        class="px-3 py-1 rounded-[6px] border text-[12px] hover:bg-purple-50 transition-colors"
                        style="border-color: var(--primary); color: var(--primary)"
                        @click="setDefaultStore(addr.id)"
                      >設為預設</button>
                      <button
                        class="px-3 py-1 rounded-[6px] border text-[12px] hover:bg-red-50 transition-colors"
                        style="border-color: #ef4444; color: #ef4444"
                        @click="deleteStore(addr.id)"
                      >刪除</button>
                    </div>
                  </div>
                  <button
                    class="w-full px-4 py-2 rounded-[6px] border border-[#cbd5e1] text-sm text-[#334155] hover:bg-gray-50 transition-colors"
                    @click="shipDrawerView = 'add-store'"
                  >+ 新增超商地址</button>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-4">
              <button class="px-5 py-2 rounded-[6px] border border-[#cbd5e1] text-sm text-[#334155] hover:bg-gray-50 transition-colors" @click="shipDrawerOpen = false">取消</button>
              <button class="px-5 py-2 rounded-[6px] text-white text-sm font-medium" style="background: var(--primary-bg)" @click="shipDrawerOpen = false">確認</button>
            </div>
          </template>

          <!-- ===== View: add-home ===== -->
          <template v-else-if="shipDrawerView === 'add-home'">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-[18px] text-[#020617]">新增宅配地址</h3>
              <button class="text-[#334155] hover:opacity-70" @click="shipDrawerView = 'list'">
                <i class="pi pi-times" />
              </button>
            </div>

            <div class="flex flex-col gap-3 max-w-[440px] mx-auto">
              <div class="flex flex-col gap-1">
                <label class="text-sm text-[#334155]">收件人姓名</label>
                <input v-model="newHomeName" type="text" class="h-[36px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] transition-colors text-[#334155]" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm text-[#334155]">收件人電話</label>
                <div class="flex gap-2">
                  <select v-model="newHomeCountryCode" class="appearance-none h-[36px] pl-3 pr-8 text-sm rounded-[6px] border border-[#cbd5e1] bg-white outline-none focus:border-[var(--primary)] transition-colors text-[#334155] w-[100px]">
                    <option value="+886">+886</option>
                    <option value="+852">+852</option>
                  </select>
                  <input v-model="newHomePhone" type="tel" class="flex-1 h-[36px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] transition-colors text-[#334155]" />
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm text-[#334155]">國別</label>
                <select v-model="newHomeCountry" class="appearance-none h-[36px] pl-3 pr-8 text-sm rounded-[6px] border border-[#cbd5e1] bg-white outline-none focus:border-[var(--primary)] transition-colors text-[#334155]">
                  <option value="台灣">台灣</option>
                  <option value="香港">香港</option>
                </select>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm text-[#334155]">城市/區</label>
                <div class="flex gap-2">
                  <select v-model="newHomeCity" class="flex-1 appearance-none h-[36px] pl-3 pr-8 text-sm rounded-[6px] border border-[#cbd5e1] bg-white outline-none focus:border-[var(--primary)] transition-colors text-[#334155]">
                    <option value="高雄市">高雄市</option>
                    <option value="台北市">台北市</option>
                    <option value="桃園市">桃園市</option>
                  </select>
                  <select v-model="newHomeDistrict" class="flex-1 appearance-none h-[36px] pl-3 pr-8 text-sm rounded-[6px] border border-[#cbd5e1] bg-white outline-none focus:border-[var(--primary)] transition-colors text-[#334155]">
                    <option value="前鎮區">前鎮區</option>
                    <option value="三民區">三民區</option>
                    <option value="信義區">信義區</option>
                  </select>
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm text-[#334155]">詳細收件地址</label>
                <input v-model="newHomeAddress" type="text" class="h-[36px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] transition-colors text-[#334155]" />
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-4">
              <button class="px-5 py-2 rounded-[6px] border border-[#cbd5e1] text-sm text-[#334155] hover:bg-gray-50 transition-colors" @click="shipDrawerView = 'list'">取消</button>
              <button class="px-5 py-2 rounded-[6px] text-white text-sm font-medium" style="background: var(--primary-bg)" @click="submitAddHome">確認新增</button>
            </div>
          </template>

          <!-- ===== View: add-store ===== -->
          <template v-else-if="shipDrawerView === 'add-store'">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold text-[18px] text-[#020617]">新增超商門市</h3>
              <button class="text-[#334155] hover:opacity-70" @click="shipDrawerView = 'list'">
                <i class="pi pi-times" />
              </button>
            </div>

            <div class="flex flex-col gap-4 max-w-[440px] mx-auto">
              <div class="flex flex-col gap-2">
                <label class="text-sm text-[#334155]">選擇超商</label>
                <div class="flex gap-3">
                  <button
                    class="w-[60px] h-[40px] rounded-[6px] border-2 flex items-center justify-center text-white text-[11px] font-bold transition-all"
                    :style="newStoreChain === '7-11' ? 'border-color: var(--primary); background: #ee1c25' : 'border-color: transparent; background: #ee1c25'"
                    @click="pickChain('7-11')"
                  >7-ELEVEN</button>
                  <button
                    class="w-[60px] h-[40px] rounded-[6px] border-2 flex items-center justify-center text-white text-[11px] font-bold transition-all"
                    :style="newStoreChain === 'FamilyMart' ? 'border-color: var(--primary); background: #00a040' : 'border-color: transparent; background: #00a040'"
                    @click="pickChain('FamilyMart')"
                  >Family</button>
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm text-[#334155]">選擇取件門市</label>
                <div v-if="!newStoreChain" class="font-bold text-[#334155]">請先選擇超商</div>
                <div v-else>
                  <p class="font-bold text-[#334155]">{{ pickedStoreName }}</p>
                  <p class="text-sm text-[#475569]">{{ pickedStoreAddr }}</p>
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm text-[#334155]">收件人姓名</label>
                <input v-model="newStoreName" type="text" class="h-[36px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] transition-colors text-[#334155]" />
              </div>
              <div class="flex flex-col gap-1">
                <label class="text-sm text-[#334155]">收件人電話</label>
                <div class="flex gap-2">
                  <select v-model="newHomeCountryCode" class="appearance-none h-[36px] pl-3 pr-8 text-sm rounded-[6px] border border-[#cbd5e1] bg-white outline-none focus:border-[var(--primary)] transition-colors text-[#334155] w-[100px]">
                    <option value="+886">+886</option>
                    <option value="+852">+852</option>
                  </select>
                  <input v-model="newStorePhone" type="tel" class="flex-1 h-[36px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] transition-colors text-[#334155]" />
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-2 mt-4">
              <button class="px-5 py-2 rounded-[6px] border border-[#cbd5e1] text-sm text-[#334155] hover:bg-gray-50 transition-colors" @click="shipDrawerView = 'list'">取消</button>
              <button class="px-5 py-2 rounded-[6px] text-white text-sm font-medium" style="background: var(--primary-bg)" @click="submitAddStore">確認新增</button>
            </div>
          </template>

        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.shadow-card {
  box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.1);
}

.qty-input {
  -moz-appearance: textfield;
  appearance: textfield;
}
.qty-input::-webkit-inner-spin-button,
.qty-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.cart-divider,
.cart-divider-top {
  position: relative;
}
.cart-divider::after,
.cart-divider-top::before {
  content: '';
  position: absolute;
  left: var(--card-pad);
  right: var(--card-pad);
  height: 1px;
  background: #e2e8f0;
}
.cart-divider::after { bottom: 0; }
.cart-divider-top::before { top: 0; }

/* ===== Drawer ===== */
.drawer-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
}
.drawer-panel {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  z-index: 110;
  background: white;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
}

.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.25s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translate(-50%, 100%);
}

/* ===== Toast ===== */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
