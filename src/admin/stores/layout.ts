import { defineStore } from 'pinia'

interface LayoutState {
  /** 側邊欄是否收合 */
  isSidebarCollapsed: boolean
  /** 當前展開的選單群組 key；null 表示全部收合 */
  activeGroup: string | null
}

/**
 * 全域版面狀態 store（Sidebar 收合 / 當前展開群組）。
 */
export const useLayoutStore = defineStore('layout', {
  state: (): LayoutState => ({
    isSidebarCollapsed: false,
    activeGroup: 'live',
  }),
  actions: {
    /**
     * 切換側邊欄展開狀態。
     */
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed
    },
    /**
     * 設定當前展開群組；同一群組重複點擊會收合。
     *
     * @param {string} key - 群組識別 key
     */
    setActiveGroup(key: string) {
      this.activeGroup = this.activeGroup === key ? null : key
    },
  },
})
