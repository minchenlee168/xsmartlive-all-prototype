<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const banners = [
  { id: 1, label: '新品上市', title: '新品上市\n第二件全面五折起' },
  { id: 2, label: '秋冬特賣', title: '秋冬童裝\n限時搶購中' },
  { id: 3, label: '廠商出清', title: '廠商庫存\n超低特價放送' },
]

const current = ref(0)
let timer: ReturnType<typeof setInterval>

onMounted(() => { timer = setInterval(() => { current.value = (current.value + 1) % banners.length }, 4000) })
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div class="relative rounded-[8px] overflow-hidden border border-[#e5e5e5] h-[480px]">
    <!-- Slides -->
    <div
      class="flex h-full transition-transform duration-500"
      :style="{ transform: `translateX(-${current * 100}%)` }"
    >
      <div
        v-for="b in banners"
        :key="b.id"
        class="min-w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 relative flex items-end"
      >
        <!-- overlay -->
        <div class="absolute inset-0 bg-black/40" />
        <!-- text badge top-right -->
        <div class="absolute top-6 right-8 text-right z-10">
          <span class="text-white text-sm font-bold px-3 py-1 rounded-full" style="background: var(--primary-bg)">{{ b.label }}</span>
          <p class="text-white text-2xl font-bold mt-2 whitespace-pre-line leading-snug drop-shadow">{{ b.title }}</p>
        </div>
      </div>
    </div>

    <!-- Dots -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
      <button
        v-for="(_, i) in banners"
        :key="i"
        class="h-1.5 rounded-full transition-all duration-300"
        :class="i === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'"
        @click="current = i"
      />
    </div>
  </div>
</template>
