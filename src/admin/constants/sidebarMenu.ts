import type { PermissionKey } from '@/admin/constants/permissions'
import { RouteName } from '@/admin/router'

export interface MenuItem {
  labelKey: string
  icon?: string | string[]
  to?: string
  url?: string
  target?: string
  items?: MenuItem[]
  permissionKey?: PermissionKey | PermissionKey[]
}

/**
 * 主選單。
 *
 * 對齊 portal-vue 的 sidebarMenu 結構（labelKey / icon / to / items），
 * 但只放本 prototype 已實作的模組：直播收單區、行銷活動。
 * portal-vue 既有但尚未在本 prototype 開發的（商品管理 / 訂單管理 / 我的商城 /
 * 客服管理 / 會員管理 / 設定…）暫不列入。
 */
export const sidebarMenu: MenuItem[] = [
  {
    labelKey: 'nav.live',
    icon: ['fas', 'tower-broadcast'],
    items: [
      {
        labelKey: 'nav.live_order',
        icon: ['fas', 'file-circle-plus'],
        to: RouteName.LiveOrder,
      },
      {
        labelKey: 'nav.live_records',
        icon: ['fas', 'clipboard-list'],
        to: RouteName.LiveRecords,
      },
    ],
  },
  {
    labelKey: 'nav.marketing',
    icon: ['fas', 'bullhorn'],
    items: [
      {
        labelKey: 'nav.bid_gift_lottery',
        icon: ['fas', 'gift'],
        to: RouteName.BidGiftLotteryList,
      },
      {
        labelKey: 'nav.keyword_lottery',
        icon: ['fas', 'hashtag'],
        to: RouteName.KeywordLotteryList,
      },
    ],
  },
]

/**
 * 商家管理子選單（sidebar 底部「商家管理」按鈕點下後切換到的選單）。
 */
export const merchantManagementMenu: MenuItem[] = [
  {
    labelKey: 'nav.merchant_management.store_management',
    icon: ['fas', 'shop'],
    to: RouteName.StoreManagement,
  },
]
