<template>
  <!-- 收單操作頁（多收單來源） -->
  <!-- 左：(slot products-header) + 商品 grid；右(可隱藏)：Tabs(留言區 / 收單來源) 340px -->
  <div class="flex gap-4 flex-1 min-h-0">

    <!-- 左：商品 grid -->
    <div class="flex-1 min-w-0 flex flex-col gap-4 min-h-0">
      <!-- 頂部 slot：給 LiveOrderPage 放 QuickAddProductForm，與右側 panel 頂部對齊 -->
      <slot name="products-header" />

      <div class="flex-1 min-h-0 overflow-y-auto">
        <div v-if="products.length === 0" class="flex flex-col items-center gap-2 text-[var(--p-text-muted-color)] pt-12">
          <i class="pi pi-inbox" style="font-size:40px"></i>
          <span class="text-[13px]">{{ t('live_order.empty.no_product_added_hint') }}</span>
        </div>
        <div v-else class="grid gap-2 justify-start" style="grid-template-columns: repeat(auto-fill, 240px)">
          <LiveProductCard
            v-for="p in products"
            :key="p.id"
            :product="p"
            v-model:status="p.status"
            @delete="(id) => emit('delete-product', id)"
          />
        </div>
      </div>
    </div>

    <!-- 右：來源預覽 + Tabs（showComments=false 時收起留言 tab + 縮窄面板） -->
    <aside :class="['shrink-0 flex flex-col gap-3 min-h-0 overflow-hidden',
                     showComments ? 'w-[340px]' : 'w-[240px]']">

      <!-- 預覽區（只在 FB 系列來源時顯示，IG / TikTok 無影片畫面隱藏） -->
      <div v-if="sources.length > 0 && hasPreview" class="relative shrink-0">
        <div class="bg-[#0f172a] rounded-[6px] overflow-hidden relative flex items-center justify-center" style="height:125px">
          <div class="bg-[var(--p-content-background)] rounded-[6px] overflow-hidden shadow-md flex flex-col" style="width:70px; height:113px">
            <div class="flex-1 bg-gradient-to-br from-[#fef3c7] via-[#fed7aa] to-[#fda4af] flex items-center justify-center">
              <i class="pi pi-image text-[#d97706]" style="font-size:16px"></i>
            </div>
            <div class="bg-[var(--p-content-background)] px-1 py-0.5 text-[6px] text-[var(--p-text-color)] leading-tight">
              {{ previewMeta.previewLabel }}
            </div>
          </div>
          <span class="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded leading-none">{{ previewMeta.badge }}</span>
          <i :class="previewMeta.previewIcon" class="absolute bottom-1.5 right-1.5 text-white/60" style="font-size:14px"></i>
        </div>

        <!-- 多來源:左右切換 + 指示點 -->
        <template v-if="previewableSources.length > 1">
          <button @click="prevPreview"
            class="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center">
            <i class="pi pi-chevron-left" style="font-size:12px"></i>
          </button>
          <button @click="nextPreview"
            class="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center">
            <i class="pi pi-chevron-right" style="font-size:12px"></i>
          </button>
          <div class="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            <span v-for="(_, i) in previewableSources" :key="i"
              :class="['w-1.5 h-1.5 rounded-full', i === previewIndex % previewableSources.length ? 'bg-[var(--p-content-background)]' : 'bg-[var(--p-content-background)]/40']"></span>
          </div>
        </template>
      </div>

      <Tabs v-model:value="activeTab" class="flex flex-col flex-1 min-h-0 !bg-transparent">
        <TabList class="!bg-transparent">
          <Tab v-if="showComments" value="comments" class="!bg-transparent">
            <span class="flex items-center gap-1.5">
              <i class="pi pi-comments" style="font-size:14px"></i>
              <span>{{ t('live_order.tab.comments') }}</span>
            </span>
          </Tab>
          <Tab value="sources" class="!bg-transparent">
            <span class="flex items-center gap-1.5">
              <i class="pi pi-link" style="font-size:14px"></i>
              <span>{{ t('live_order.tab.sources') }}</span>
              <span v-if="sources.length > 0"
                class="bg-[var(--p-primary-color)] text-white text-[10px] font-bold leading-none rounded-full min-w-[16px] h-[16px] px-1 inline-flex items-center justify-center">
                {{ sources.length }}
              </span>
            </span>
          </Tab>
        </TabList>
        <TabPanels class="flex-1 min-h-0 flex flex-col !p-0 !bg-transparent">

          <!-- 留言區 Tab：混合多平台（須有商品開始收單才顯示） -->
          <TabPanel v-if="showComments" value="comments" class="flex-1 min-h-0 flex flex-col gap-2 overflow-y-auto pt-3 pr-1 !bg-transparent">
            <template v-if="hasLiveProduct">
              <LiveCommentCard v-for="c in filteredComments" :key="c.id"
                :comment="c"
                :platform-meta="getPlatformMeta(c.platform)"
                :live-products="liveProducts"
                :session-products="props.products"
                @blacklist="onBlacklist"
                @unblacklist="onUnblacklist" />
            </template>
            <div v-else class="flex flex-col items-center gap-2 text-[var(--p-text-muted-color)] pt-8">
              <i class="pi pi-comments" style="font-size:32px"></i>
              <span class="text-[12.25px]">{{ t('live_order.empty.no_live_product_yet') }}</span>
              <span class="text-[13px] text-[var(--p-text-color)]">{{ t('live_order.empty.comments_will_show') }}</span>
            </div>
          </TabPanel>

          <!-- 收單來源 Tab：新增按鈕 + 來源卡列表 -->
          <TabPanel value="sources" class="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto pt-3 pr-1 !bg-transparent">
            <!-- 新增按鈕 -->
            <button @click="$emit('pick-source')"
              class="bg-[var(--p-content-background)] border border-dashed border-[var(--p-primary-color)] text-[var(--p-primary-color)] rounded-[8px] px-3 py-2.5 text-[14px] font-medium flex items-center justify-center gap-2 hover:bg-[var(--p-primary-50)]">
              <i class="pi pi-plus" style="font-size:14px"></i>
              {{ t('live_order.button.add_source') }}
            </button>

            <!-- 來源卡列表 -->
            <div v-if="sources.length === 0"
              class="flex flex-col items-center gap-2 text-[var(--p-text-muted-color)] pt-8">
              <i class="pi pi-inbox" style="font-size:32px"></i>
              <span class="text-[12.25px]">{{ t('live_order.empty.no_source_added') }}</span>
            </div>
            <div v-else class="flex flex-col gap-2">
              <div v-for="s in sources" :key="s.id"
                :class="['border rounded-[8px] px-3 py-2.5 flex items-center gap-3 bg-[var(--p-content-background)]',
                  sourceCardBorderClass(s.type)]">
                <div :class="['w-[36px] h-[36px] rounded-[8px] flex items-center justify-center shrink-0',
                  sourceCardBgClass(s.type)]">
                  <FontAwesomeIcon
                    :icon="getPlatformMeta(s.type).platformIcon"
                    :style="{ fontSize: '16px', color: getPlatformMeta(s.type).platformColor }"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-bold text-[14px] text-[var(--p-text-color)] truncate">{{ s.label }}</div>
                  <div class="text-[11px] text-[var(--p-text-muted-color)] mt-0.5">{{ t('live_order.label.added_at', { time: formatTime(s.addedAt) }) }}</div>
                </div>
                <button @click="$emit('remove-source', s.id)"
                  v-tooltip.top="t('live_order.tooltip.remove_source')"
                  class="text-[var(--p-text-muted-color)] hover:text-[#ef4444] shrink-0">
                  <i class="pi pi-times" style="font-size:14px"></i>
                </button>
              </div>
            </div>
          </TabPanel>

        </TabPanels>
      </Tabs>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import LiveProductCard from './LiveProductCard.vue'
import LiveCommentCard from './LiveCommentCard.vue'

interface LiveSource {
  id: number | string
  type: string
  label: string
  addedAt?: Date | string | number
  postId?: number | string | null
  groupId?: number | string | null
  [key: string]: unknown
}

interface LiveProduct {
  id: number
  status?: string
  keyword?: string
  sku?: string
  [key: string]: unknown
}

interface LiveComment {
  id: number
  user: string
  text: string
  platform: string
  tagType?: string
  pinned?: boolean
  stars?: number
  time: string
}

interface PlatformMeta {
  /** FontAwesomeIcon 接受的 [prefix, name] 陣列；renderer 直接綁到 :icon。 */
  platformIcon: [string, string]
  platformColor: string
}

interface PreviewMeta {
  previewIcon: string
  previewLabel: string
  badge: string
}

interface Props {
  sources?: LiveSource[]
  products?: LiveProduct[]
  showComments?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  sources: () => [],
  products: () => [],
  showComments: true,
})

const emit = defineEmits<{
  'pick-source': []
  'remove-source': [id: number | string]
  'delete-product': [id: number]
}>()

const { t } = useI18n()

const activeTab = ref('comments')

// 顯示留言關閉時，自動切到「收單來源」tab
watch(() => props.showComments, (show) => {
  if (!show) activeTab.value = 'sources'
  else if (activeTab.value !== 'comments') activeTab.value = 'comments'
}, { immediate: true })

// 是否有商品已開始收單（status === 'live'）— 留言區顯示條件
const hasLiveProduct = computed(() => props.products.some(p => p.status === 'live'))

// 收單中的商品 — 供留言卡「追加訂單」挑選
const liveProducts = computed(() => props.products.filter(p => p.status === 'live'))

// ── 來源預覽(多來源時左右切換) ─────────────────
const previewIndex = ref(0)

const previewMetaMap = computed<Record<string, PreviewMeta>>(() => ({
  fb:    { previewIcon: 'fa-brands fa-facebook',   previewLabel: t('live_order.label.fb_post'),       badge: t('live_order.label.fb_badge') },
  ig:    { previewIcon: 'fa-brands fa-instagram',  previewLabel: t('live_order.label.ig_post'),       badge: t('live_order.label.ig_badge') },
  group: { previewIcon: 'fa-brands fa-facebook',   previewLabel: t('live_order.label.fb_group'),      badge: t('live_order.label.group_badge') },
  live:  { previewIcon: 'pi pi-video',             previewLabel: t('live_order.label.live_streaming'), badge: t('live_order.label.live_badge') },
}))
const previewMeta = computed<PreviewMeta>(() => {
  const s = previewMetaSource.value
  return (s && previewMetaMap.value[s.type]) || { previewIcon: 'pi pi-question-circle', previewLabel: t('live_order.label.unknown'), badge: t('live_order.label.unknown_short') }
})

/**
 * 預覽區只在「有實際影片畫面」的來源類型才顯示；
 * 目前只有 Facebook 系列（fb 貼文 / live 直播 / fb 社團）會給影片或可預覽畫面，
 * IG / TikTok 等純圖文/留言來源不顯示。
 *
 * 顯示規則：
 * - 收單來源只有 IG / TikTok → 整個預覽 block 隱藏
 * - 若有任何 FB 系列來源 → 顯示，預覽自動鎖定在 FB 系列來源（非 FB 的略過）
 */
const PREVIEWABLE_TYPES = new Set(['fb', 'live', 'group'])

/** 過濾出可預覽（FB 系列）的來源；空陣列代表整個預覽要隱藏 */
const previewableSources = computed(() =>
  props.sources.filter((s) => PREVIEWABLE_TYPES.has(s.type)),
)

const hasPreview = computed<boolean>(() => previewableSources.value.length > 0)

/** 預覽 meta 改讀 previewableSources，跳過 IG / TikTok 來源 */
const previewMetaSource = computed(() => {
  const list = previewableSources.value
  if (list.length === 0) return undefined
  return list[previewIndex.value % list.length]
})

function prevPreview(): void {
  const n = previewableSources.value.length
  if (n === 0) return
  previewIndex.value = (previewIndex.value - 1 + n) % n
}
function nextPreview(): void {
  const n = previewableSources.value.length
  if (n === 0) return
  previewIndex.value = (previewIndex.value + 1) % n
}

// 可預覽來源數變動時 clamp index（避免移除 FB 來源後 index 越界）
watch(() => previewableSources.value.length, (n) => {
  if (previewIndex.value >= n) previewIndex.value = Math.max(0, n - 1)
})

// 多平台留言 mock：留言文字直接用「{商品名稱}+數量」對應到商品卡，跟商品名稱一致。
// 模板的 {nameN} 由「當前場次商品」的 name 循環填入，**非禮物商品優先**。
// 真正的「已下單」判定（orderMatch）仍只看 status==='live' 的商品。
const fallbackName = '直播商品'
const currentNames = computed<string[]>(() => {
  const all = props.products
    .map(p => ({ name: (p?.name as string | undefined) ?? '', isGift: !!(p as { isGift?: boolean })?.isGift }))
    .filter((x): x is { name: string; isGift: boolean } => Boolean(x.name))
  const nonGift = all.filter(x => !x.isGift).map(x => x.name)
  const gift = all.filter(x => x.isGift).map(x => x.name)
  const list = [...nonGift, ...gift]
  return list.length > 0 ? list : [fallbackName]
})
const commentTemplates: LiveComment[] = [
  { id: 1, user: '粉絲團小編',       text: '最後1分鐘～',         platform: 'fb',    tagType: 'official', pinned: true,  time: '2025-12-17 20:48:07' },
  { id: 2, user: 'Haji Abdul Mali…', text: '{name0}+1',           platform: 'fb',    stars: 3,             time: '2025-12-17 20:48:07' },
  { id: 3, user: '陳大悅',           text: '早安',                platform: 'ig',    stars: 3,             time: '2025-12-17 20:48:07' },
  { id: 4, user: '王大天',           text: '{name1}+1',           platform: 'live',  stars: 3,             time: '2025-12-17 20:48:07' },
  { id: 5, user: 'Jade Liu',         text: '{name2}+1',           platform: 'ig',    tagType: 'blacklist', time: '2025-12-17 20:48:07' },
  { id: 6, user: '張曉明',           text: '{name0}+1',           platform: 'group', tagType: 'vip',       time: '2025-12-17 20:48:07' },
  { id: 7, user: '林小美',           text: '{name1}+3',           platform: 'fb',    stars: 2,             time: '2025-12-17 20:49:12' },
  { id: 8, user: '蔡先生',           text: '我要一件 {name2}+1',  platform: 'live',  stars: 4,             time: '2025-12-17 20:49:30' },
]
/** 把模板裡的 {nameN} 換成第 N 個商品名稱（循環取用）。 */
function applyNames(text: string, names: string[]): string {
  return text.replace(/\{name(\d+)\}/g, (_, i) => names[Number(i) % names.length])
}
const comments = ref<LiveComment[]>(commentTemplates.map(c => ({ ...c })))
watch(currentNames, names => {
  comments.value = commentTemplates.map(c => ({ ...c, text: applyNames(c.text, names) }))
}, { immediate: true, deep: true })

// 留言只顯示來自當前場次已加入收單來源的平台
const activeSourceTypes = computed(() => new Set(props.sources.map(s => s.type)))
const filteredComments = computed(() =>
  comments.value.filter(c => activeSourceTypes.value.has(c.platform))
)


function onBlacklist(id: number | string): void {
  const c = comments.value.find(x => x.id === id)
  if (c) c.tagType = 'blacklist'
}
function onUnblacklist(id: number | string): void {
  const c = comments.value.find(x => x.id === id)
  if (c && c.tagType === 'blacklist') c.tagType = undefined
}

const platformsMap: Record<string, PlatformMeta> = {
  fb:    { platformIcon: ['fab', 'facebook'],  platformColor: '#1877f2' },
  ig:    { platformIcon: ['fab', 'instagram'], platformColor: '#db2777' },
  group: { platformIcon: ['far', 'users'],     platformColor: '#16a34a' },
  live:  { platformIcon: ['far', 'video'],     platformColor: '#ef4444' },
}
/** Look up icon / colour metadata for a platform key; falls back to a neutral set. */
function getPlatformMeta(type: string): PlatformMeta {
  return platformsMap[type] || { platformIcon: ['far', 'circle-question'], platformColor: 'var(--p-text-muted-color)' }
}

function sourceCardBgClass(type: string): string {
  return ({
    fb:    'bg-[#dbeafe]',
    ig:    'bg-[#fce7f3]',
    group: 'bg-[#dcfce7]',
    live:  'bg-[#fee2e2]',
  } as Record<string, string>)[type] || 'bg-[var(--p-content-hover-background)]'
}
function sourceCardBorderClass(type: string): string {
  return ({
    fb:    'border-[#bfdbfe]',
    ig:    'border-[#fbcfe8]',
    group: 'border-[#bbf7d0]',
    live:  'border-[#fecaca]',
  } as Record<string, string>)[type] || 'border-[var(--p-content-border-color)]'
}

/** Render a HH:MM:SS string from a Date / timestamp / ISO input. */
function formatTime(d: Date | string | number | undefined): string {
  const date: Date = d instanceof Date ? d : new Date(d ?? Date.now())
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
</script>
