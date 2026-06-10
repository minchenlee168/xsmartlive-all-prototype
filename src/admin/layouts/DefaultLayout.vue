<script setup lang="ts">
import { onMounted } from 'vue'
import { useThemeStore } from '@/admin/stores/theme'
import TopBar from '@/admin/components/layout/TopBar.vue'
import Sidebar from '@/admin/components/layout/Sidebar.vue'

/**
 * 後台共用 layout，對齊 portal-vue/backend 的 DefaultLayout 結構：
 * - 頂部 TopBar：Logo / 摺疊鈕 / 店家 dropdown / 前台檢視 / Theme / Language / User
 * - 左側 Sidebar：主選單 / 底部商家管理切換
 * - 右側 Main：RouterView
 */
const themeStore = useThemeStore()

onMounted(() => {
  themeStore.applyToDom()
})
</script>

<template>
  <div class="flex flex-col w-screen h-screen">
    <TopBar />

    <div class="overflow-y-hidden flex flex-1">
      <Sidebar />

      <div class="flex flex-1 flex-col bg-gray-100 dark:bg-gray-800">
        <div class="overflow-y-auto p-4 flex flex-1 flex-col gap-4">
          <RouterView />
        </div>
      </div>
    </div>

    <ConfirmDialog />
  </div>
</template>
