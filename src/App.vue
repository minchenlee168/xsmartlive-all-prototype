<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import FloatingControls from './components/FloatingControls.vue'
import PageLoading from './components/PageLoading.vue'
import { useViewportStore } from './stores/viewport'
import { useUiStore } from './stores/ui'

const viewportStore = useViewportStore()
const ui = useUiStore()
const route = useRoute()
// 後台路徑：採桌面寬版、隱藏行動裝置 viewport frame 與浮動控制按鈕
const isAdmin = computed(() => route.path === '/admin' || route.path.startsWith('/admin/'))
// 入口頁與後台不顯示浮動控制按鈕
const showControls = computed(() => route.path !== '/' && !isAdmin.value)

const frameStyle = computed(() => {
  if (isAdmin.value) return {}
  const w = viewportStore.current.width
  if (!w) return {}
  return {
    width: `${w}px`,
    margin: '0 auto',
    boxShadow: '0 0 0 1px #e2e8f0, 0 8px 32px rgba(0,0,0,0.12)',
    minHeight: '100vh',
    overflow: 'hidden',
  }
})

const isConstrained = computed(() => !isAdmin.value && !!viewportStore.current.width)
</script>

<template>
  <div :class="isConstrained ? 'min-h-screen py-4' : ''" :style="isConstrained ? 'background: color-mix(in srgb, var(--page-bg) 60%, #94a3b8)' : ''">
    <!-- device label -->
    <div v-if="isConstrained" class="text-center mb-2">
      <span class="text-xs text-[#64748b] bg-white/80 px-3 py-1 rounded-full shadow-sm">
        <i :class="`pi pi-${viewportStore.current.id === 'mobile' ? 'mobile' : 'tablet'} mr-1`" />
        {{ viewportStore.current.label }} — {{ viewportStore.current.width }}px
      </span>
    </div>

    <!-- viewport frame -->
    <div :style="frameStyle" class="@container">
      <RouterView />
    </div>
  </div>

  <FloatingControls v-if="showControls" />

  <!-- 換頁 loading 遮罩 -->
  <PageLoading />

  <!-- PrimeVue 全域 Toast -->
  <Toast />


  <!-- Global toast -->
  <Transition name="ui-toast">
    <div
      v-if="ui.toastVisible"
      class="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#1e293b] text-white text-sm px-4 py-2.5 rounded-[8px] shadow-lg flex items-center gap-2 max-w-[90vw]"
    >
      <i class="pi pi-info-circle" />
      {{ ui.toastMessage }}
    </div>
  </Transition>
</template>

<style>
.ui-toast-enter-active,
.ui-toast-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.ui-toast-enter-from,
.ui-toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
