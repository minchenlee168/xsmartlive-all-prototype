<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  /** 直播公告頂部橫幅圖；未提供則讀 public/banners/announcement.png，不存在則顯示占位 */
  image?: string
}>()

const src = props.image ?? `${import.meta.env.BASE_URL}banners/announcement.png`
const imgError = ref(false)
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- 直播公告 header with dividers -->
    <div class="flex items-center gap-4">
      <div class="flex-1 h-px bg-[#e2e8f0]" />
      <div class="flex items-center py-1">
        <span class="text-[#334155] text-xl font-bold whitespace-nowrap">直播公告</span>
      </div>
      <div class="flex-1 h-px bg-[#e2e8f0]" />
    </div>

    <!-- Announcement card -->
    <div class="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
      <!-- 頂部橫幅圖 -->
      <div class="aspect-[3/1] w-full bg-gray-100">
        <img
          v-if="!imgError"
          :src="src"
          alt="直播公告"
          class="w-full h-full object-cover"
          @error="imgError = true"
        />
        <div v-else class="w-full h-full flex flex-col items-center justify-center gap-1.5">
          <i class="pi pi-hammer text-gray-300 text-4xl" />
          <span class="text-sm text-gray-400">圖片施工中</span>
        </div>
      </div>

      <!-- 場次文字 -->
      <div class="px-8 py-6 text-center text-[18px] font-medium text-[#334155] flex flex-col gap-4">
        <p>✨ 本週直播場次時間</p>
        <div class="leading-relaxed text-base">
          <p>秋冬童裝馬拉松來啦😎</p>
          <br />
          <p>週三 早上10點 ✨特別場✨</p>
          <p>🍂秋冬童裝廠商庫存特優廠拍🤎</p>
          <br />
          <p>週四下午兩點 ✨特別場✨</p>
          <p>🍂秋冬童裝廠商庫存特優廠拍🤎</p>
          <br />
          <p>週四晚上19點 ✨特別場✨</p>
          <br />
          <p>週五下午兩點</p>
          <p>工作室小物清倉場 快來撿優惠⚡️🤩</p>
        </div>
      </div>
    </div>
  </div>
</template>
