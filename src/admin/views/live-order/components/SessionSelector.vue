<template>
  <div class="relative" ref="rootRef">
    <button
      @click="isOpen = !isOpen"
      :class="['bg-[var(--p-content-background)] border flex items-center gap-2 rounded-[6px] hover:bg-[var(--p-content-hover-background)] justify-between',
        isSelectedLive ? 'border-[var(--p-primary-400)] min-w-[300px]' : 'border-[var(--p-content-border-color)] min-w-[220px]',
        size === 'lg'
          ? 'px-[11.5px] py-[8px] text-[14px]'
          : 'px-[9.75px] py-[6.25px] text-[12.25px]']">
      <span class="flex items-center gap-2 text-[var(--p-text-color)]">
        <i class="pi pi-calendar text-[var(--p-primary-color)]" :style="{ fontSize: size === 'lg' ? '14px' : '12.25px' }"></i>
        <span class="font-medium">{{ selected ? `${selected.date} ${selected.name}` : t('live_order.label.select_session') }}</span>
        <!-- 收單進行中：分隔點 + 紫色脈動圓點 + 文字 + 計時器 -->
        <template v-if="isSelectedLive">
          <span class="text-[var(--p-content-border-color)]">·</span>
          <i class="pi pi-circle-fill animate-pulse text-[var(--p-primary-color)]" style="font-size:8px"></i>
          <span class="font-bold text-[var(--p-primary-color)]">{{ t('live_order.label.live_ordering') }}</span>
          <span class="font-medium tabular-nums text-[var(--p-primary-color)]">{{ liveElapsed }}</span>
        </template>
      </span>
      <i :class="['pi text-[var(--p-text-muted-color)]', isOpen ? 'pi-chevron-up' : 'pi-chevron-down']"
        :style="{ fontSize: size === 'lg' ? '12px' : '12px' }"></i>
    </button>

    <!-- Dropdown panel -->
    <div v-if="isOpen"
      class="absolute z-30 top-full left-0 mt-1 w-[300px] bg-[var(--p-content-background)] border border-[var(--p-content-border-color)] rounded-[6px] shadow-[0px_4px_12px_rgba(0,0,0,0.1)]">
      <div class="max-h-[260px] overflow-y-auto">
        <template v-if="sessions.length">
          <button v-for="s in sessions" :key="s.id" @click="pick(s)"
            class="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--p-content-hover-background)] text-left"
            :class="selected?.id === s.id ? 'bg-[var(--p-primary-50)]' : ''">
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-[14px] font-medium text-[var(--p-text-color)] truncate">{{ s.name }}</span>
                <i v-if="s.products?.some(p => p.status === 'live')" v-tooltip.top="t('live_order.tooltip.ordering_in_progress')"
                  class="pi pi-circle-fill animate-pulse text-[var(--p-primary-color)]" style="font-size:8px"></i>
              </div>
              <span class="text-[12px] text-[var(--p-text-muted-color)]">{{ s.date }}</span>
            </div>
            <i v-if="selected?.id === s.id" class="pi pi-check text-[12px] text-[var(--p-primary-color)]"></i>
          </button>
        </template>
        <div v-else class="px-3 py-6 text-center text-[12px] text-[var(--p-text-muted-color)]">{{ t('live_order.empty.no_session') }}</div>
      </div>
      <div class="border-t border-[var(--p-content-border-color)] p-2">
        <button @click="onCreate"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[4px] text-[14px] font-medium text-[var(--p-primary-color)] hover:bg-[var(--p-primary-50)]">
          <i class="pi pi-plus text-[12px]"></i>{{ t('live_order.button.create_session') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface LiveSessionProduct {
  id: number
  status?: string
  keyword?: string
  sku?: string
  [key: string]: unknown
}

interface LiveSession {
  id: number
  name: string
  date: string
  products?: LiveSessionProduct[]
  sources?: unknown[]
  [key: string]: unknown
}

interface Props {
  sessions?: LiveSession[]
  selected?: LiveSession | null
  size?: string
  liveElapsed?: string
}
const props = withDefaults(defineProps<Props>(), {
  sessions: () => [],
  selected: null,
  size: 'lg',
  liveElapsed: '',
})

const isSelectedLive = computed(() =>
  !!(props.selected?.products?.some(p => p.status === 'live'))
)
const emit = defineEmits<{
  select: [session: LiveSession]
  create: []
}>()

const isOpen = ref(false)
const rootRef = ref<HTMLElement | null>(null)

/** Pick a session and close the dropdown. */
function pick(s: LiveSession): void { emit('select', s); isOpen.value = false }

/** Close the dropdown and request the parent to open the create dialog. */
function onCreate(): void { isOpen.value = false; emit('create') }

/** Close the dropdown when clicking outside the root element. */
function onDocClick(e: MouseEvent): void {
  if (rootRef.value && !rootRef.value.contains(e.target as Node)) isOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>
