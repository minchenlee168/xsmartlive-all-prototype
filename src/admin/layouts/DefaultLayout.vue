<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/admin/stores/theme'
import { useLayoutStore } from '@/admin/stores/layout'
import { RouteName } from '@/admin/router'
import iconSignalStream from '@/admin/assets/icon-signal-stream.svg'
import logoMark from '@/admin/assets/logo-mark.svg'

/**
 * Sidebar 子項目定義。
 */
interface NavChild {
  key: string
  i18nKey: string
  route?: string
  icon?: string
  imgSrc?: string
  imgW?: number
  imgH?: number
}

/**
 * Sidebar 群組定義。
 */
interface NavGroup {
  key: string
  i18nKey: string
  icon?: string
  imgSrc?: string
  imgW?: number
  imgH?: number
  children?: NavChild[]
}

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const themeStore = useThemeStore()
const layoutStore = useLayoutStore()
const { isDark } = storeToRefs(themeStore)
const { isSidebarCollapsed, activeGroup } = storeToRefs(layoutStore)

onMounted(() => {
  themeStore.applyToDom()
})

const navGroups: NavGroup[] = [
  {
    key: 'live',
    i18nKey: 'nav.live',
    imgSrc: iconSignalStream,
    children: [
      {
        key: 'live-order',
        i18nKey: 'nav.live_order',
        route: RouteName.LiveOrder,
        icon: 'pi pi-file-plus',
      },
      {
        key: 'live-records',
        i18nKey: 'nav.live_records',
        route: RouteName.LiveRecords,
        icon: 'pi pi-clipboard',
      },
    ],
  },
  {
    key: 'marketing',
    i18nKey: 'nav.marketing',
    icon: 'pi pi-megaphone',
    children: [
      {
        key: 'bid-gift-lottery',
        i18nKey: 'nav.bid_gift_lottery',
        route: RouteName.BidGiftLotteryList,
        icon: 'pi pi-gift',
      },
      {
        key: 'keyword-lottery',
        i18nKey: 'nav.keyword_lottery',
        route: RouteName.KeywordLotteryList,
        icon: 'pi pi-hashtag',
      },
    ],
  },
  {
    key: 'merchant-management',
    i18nKey: 'nav.merchant_management.merchant_management',
    icon: 'pi pi-shop',
    children: [
      {
        key: 'store-management',
        i18nKey: 'nav.merchant_management.store_management',
        route: RouteName.StoreManagement,
        icon: 'pi pi-building',
      },
    ],
  },
]

function onGroupClick(group: NavGroup): void {
  if (group.children) {
    layoutStore.setActiveGroup(group.key)
  }
}

function isGroupActive(group: NavGroup): boolean {
  if (group.children) {
    const hasActiveChild = group.children.some((c) => c.route && c.route === route.name)
    return hasActiveChild || activeGroup.value === group.key
  }
  return false
}

function isChildActive(child: NavChild): boolean {
  return !!child.route && child.route === route.name
}

function onChildClick(child: NavChild): void {
  if (child.route) {
    router.push({ name: child.route })
  }
}
</script>

<template>
  <div class="min-h-screen bg-[var(--p-app-background)] flex flex-col">
    <!-- ── Header ───────────────────────────────────────── -->
    <header
      class="w-full h-[60px] bg-[var(--p-content-background)] border-b border-[var(--p-content-border-color)] flex items-center px-6 shrink-0 z-10"
    >
      <div class="flex items-center gap-[22px] shrink-0">
        <div class="flex items-center gap-2">
          <img :src="logoMark" style="width: 36px; height: 30px" alt="logo" />
          <span
            class="font-medium text-[20px] text-[var(--p-text-color)] tracking-[0.3px]"
          >
            {{ t('system.app_name') }}
          </span>
        </div>
        <button
          class="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[var(--p-content-hover-background)]"
          @click="layoutStore.toggleSidebar()"
        >
          <i
            class="text-[12.25px] text-[var(--p-text-color)]"
            :class="isSidebarCollapsed ? 'pi pi-chevron-right' : 'pi pi-chevron-left'"
          ></i>
        </button>
      </div>

      <div class="flex flex-1 items-center justify-between min-w-0 ml-4">
        <div class="flex flex-1 items-center gap-4 min-w-0">
          <span class="font-normal text-sm text-[var(--p-primary-color)] whitespace-nowrap">
            {{ t('layout.current_merchant', { name: '3C 瘋電玩' }) }}
          </span>
          <div class="flex items-center gap-2">
            <Button
              variant="outlined"
              severity="secondary"
              size="small"
              :label="t('layout.button.front_view')"
              icon="pi pi-eye"
            />
            <Button
              variant="outlined"
              severity="secondary"
              size="small"
              :label="t('layout.button.switch_merchant')"
            >
              <template #icon>
                <FontAwesomeIcon
                  :icon="['fas', 'arrow-right-arrow-left']"
                  class="mr-1"
                />
              </template>
            </Button>
          </div>
        </div>

        <div class="flex items-center gap-4 shrink-0">
          <button
            class="relative w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[var(--p-content-hover-background)]"
          >
            <i class="pi pi-envelope text-[20px] text-[var(--p-text-color)]"></i>
            <span class="absolute top-1 right-1 w-[7px] h-[7px] rounded-full bg-red-500"></span>
          </button>
          <button
            class="relative w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[var(--p-content-hover-background)]"
          >
            <i class="pi pi-bell text-[20px] text-[var(--p-text-color)]"></i>
            <span class="absolute top-1 right-1 w-[7px] h-[7px] rounded-full bg-red-500"></span>
          </button>
          <button
            v-tooltip.bottom="
              isDark ? t('layout.theme.switch_to_light') : t('layout.theme.switch_to_dark')
            "
            class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[var(--p-content-hover-background)]"
            @click="themeStore.toggle()"
          >
            <i
              :class="[
                'text-[20px] text-[var(--p-text-color)]',
                isDark ? 'pi pi-moon' : 'pi pi-sun',
              ]"
            ></i>
          </button>
          <div class="h-[36px] w-px bg-[var(--p-content-border-color)] mx-1"></div>
          <button
            class="flex items-center gap-[7px] px-[10.5px] py-[7px] rounded-[6px] hover:bg-[var(--p-content-hover-background)]"
          >
            <i class="pi pi-globe text-[12.25px] text-[var(--p-text-color)]"></i>
            <span class="text-[14px] font-medium text-[var(--p-text-color)]">
              {{ t('layout.language.zh_tw') }}
            </span>
            <FontAwesomeIcon
              :icon="['fas', 'sort-down']"
              class="text-[12.25px] text-[var(--p-text-color)]"
            />
          </button>
          <button
            class="flex items-center gap-[7px] px-[10.5px] py-[7px] rounded-[6px] hover:bg-[var(--p-content-hover-background)]"
          >
            <i class="pi pi-user text-[12.25px] text-[var(--p-text-color)]"></i>
            <span class="text-[14px] font-medium text-[var(--p-text-color)]">
              {{ t('layout.user.admin') }}
            </span>
            <FontAwesomeIcon
              :icon="['fas', 'sort-down']"
              class="text-[12.25px] text-[var(--p-text-color)]"
            />
          </button>
        </div>
      </div>
    </header>

    <div class="flex flex-1 min-h-0">
      <!-- ── Sidebar ─────────────────────────────────────── -->
      <aside
        :class="isSidebarCollapsed ? 'w-[56px]' : 'w-[255px]'"
        class="bg-[var(--p-content-background)] flex flex-col shrink-0 border-r border-[var(--p-content-border-color)] transition-all duration-200 overflow-x-hidden"
      >
        <nav class="flex flex-col overflow-y-auto overflow-x-hidden flex-1">
          <template v-for="group in navGroups" :key="group.key">
            <button
              v-tooltip.right="isSidebarCollapsed ? t(group.i18nKey) : null"
              class="h-[56px] w-full flex items-center transition-colors shrink-0"
              :class="[
                isGroupActive(group)
                  ? 'bg-[var(--p-primary-color)]'
                  : 'hover:bg-[var(--p-content-hover-background)]',
                isSidebarCollapsed ? 'justify-center px-0' : 'justify-between px-4',
              ]"
              @click="onGroupClick(group)"
            >
              <div class="flex items-center gap-2">
                <i
                  v-if="group.icon"
                  :class="[
                    group.icon,
                    'text-[20px] shrink-0',
                    isGroupActive(group)
                      ? 'text-[var(--p-primary-contrast-color)]'
                      : 'text-[var(--p-text-color)]',
                  ]"
                ></i>
                <img
                  v-else-if="group.imgSrc"
                  :src="group.imgSrc"
                  class="shrink-0"
                  :style="{
                    width: (group.imgW ?? 20) + 'px',
                    height: (group.imgH ?? 20) + 'px',
                    filter:
                      isGroupActive(group) || isDark ? 'brightness(0) invert(1)' : undefined,
                  }"
                />
                <span
                  v-if="!isSidebarCollapsed"
                  :class="[
                    'text-[16px] font-semibold whitespace-nowrap',
                    isGroupActive(group)
                      ? 'text-[var(--p-primary-contrast-color)]'
                      : 'text-[var(--p-text-color)]',
                  ]"
                >
                  {{ t(group.i18nKey) }}
                </span>
              </div>
              <i
                v-if="group.children && !isSidebarCollapsed"
                :class="[
                  'text-[14px]',
                  activeGroup === group.key ? 'pi pi-chevron-up' : 'pi pi-chevron-down',
                  isGroupActive(group)
                    ? 'text-[var(--p-primary-contrast-color)]'
                    : 'text-[var(--p-text-color)]',
                ]"
              ></i>
            </button>
            <template v-if="!isSidebarCollapsed && group.children && activeGroup === group.key">
              <div
                v-for="child in group.children"
                :key="child.key"
                class="flex items-center h-[56px] pl-[16px] w-full bg-[var(--p-app-child-background)] cursor-pointer hover:bg-[var(--p-app-child-hover-background)] border-r-4"
                :class="
                  isChildActive(child) ? 'border-[var(--p-primary-color)]' : 'border-transparent'
                "
                @click="onChildClick(child)"
              >
                <div class="flex items-center gap-[4px] pl-[16px] py-[16px]">
                  <i
                    v-if="child.icon"
                    :class="[
                      child.icon,
                      'text-[20px] shrink-0',
                      isChildActive(child)
                        ? 'text-[var(--p-primary-color)]'
                        : 'text-[var(--p-text-color)]',
                    ]"
                  ></i>
                  <img
                    v-else-if="child.imgSrc"
                    :src="child.imgSrc"
                    class="shrink-0"
                    :style="{
                      width: (child.imgW ?? 24) + 'px',
                      height: (child.imgH ?? 24) + 'px',
                      filter: isChildActive(child)
                        ? 'brightness(0) saturate(100%) invert(27%) sepia(81%) saturate(4891%) hue-rotate(262deg) brightness(105%)'
                        : isDark
                          ? 'brightness(0) invert(1)'
                          : undefined,
                    }"
                  />
                  <span
                    class="font-semibold text-[16px] whitespace-nowrap"
                    :class="
                      isChildActive(child)
                        ? 'text-[var(--p-primary-color)]'
                        : 'text-[var(--p-text-color)]'
                    "
                  >
                    {{ t(child.i18nKey) }}
                  </span>
                </div>
              </div>
            </template>
          </template>
        </nav>
      </aside>

      <!-- ── Main ─────────────────────────────────────────── -->
      <main class="flex-1 min-w-0 p-4 flex flex-col gap-4 overflow-y-auto">
        <RouterView />
      </main>
    </div>

    <ConfirmDialog />
  </div>
</template>
