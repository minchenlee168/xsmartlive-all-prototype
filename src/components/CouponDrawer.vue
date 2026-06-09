<script setup lang="ts">
import { computed } from 'vue'
import { useViewportStore } from '../stores/viewport'

const visible = defineModel<boolean>('visible', { default: false })

const viewportStore = useViewportStore()
// 平板與電腦版固定 680px；手機符合容器寬度
const drawerWidth = computed(() =>
  viewportStore.current.id === 'mobile' ? `${viewportStore.current.width}px` : '680px',
)

interface Coupon {
  id: number
  discount: string
  name: string
  description: string
  tagText: string
  tagType: 'danger' | 'info' | 'secondary'
  expiry: string
  disabled?: boolean
}

const coupons: Coupon[] = [
  {
    id: 1,
    discount: '折100',
    name: '滿千折百優惠券（滿1000元使用）',
    description: '活動訂單滿 $1000 現折 $100',
    tagText: '適用範圍（直播場次）：我是直播場次-2025-12-24',
    tagType: 'danger',
    expiry: '有效期限至 2026.01.20 23:00',
  },
  {
    id: 2,
    discount: '50%',
    name: '滿千五折（滿1000元使用）',
    description: '活動訂單滿 $1000 打5折',
    tagText: '適用範圍(粉絲團貼文)：我是粉絲團貼文-2025-12-24',
    tagType: 'info',
    expiry: '有效期限至 2026.01.20 23:00',
  },
  {
    id: 3,
    discount: '折300',
    name: '滿三千折三百（滿3000元使用）',
    description: '常客單筆滿 $3000 現折 $300',
    tagText: '適用範圍：全站',
    tagType: 'secondary',
    expiry: '有效期限至 2026.01.20 23:00',
    disabled: true,
  },
]
</script>

<template>
  <Drawer
    v-model:visible="visible"
    position="bottom"
    header="可使用優惠券"
    :style="{ width: drawerWidth, maxWidth: '100vw', left: 0, right: 0, margin: '0 auto', height: 'auto', maxHeight: '80vh' }"
  >
    <!-- Coupon list -->
    <div class="max-w-[680px] mx-auto flex flex-col">
      <div
        v-for="coupon in coupons"
        :key="coupon.id"
        class="flex items-stretch gap-4 px-[17.5px] py-[10.5px] border-b border-[#e2e8f0] last:border-b-0"
      >
        <!-- Left: discount value -->
        <div
          class="flex items-center gap-[8px] px-4 rounded-tl-[6px] rounded-bl-[6px] shrink-0 w-[160px] border-r border-dashed border-[#e5e7eb] py-3"
          :class="coupon.disabled ? 'bg-[#cbd5e1]' : 'bg-[#f2ebff]'"
        >
          <i
            class="pi pi-ticket text-[26px]"
            :class="coupon.disabled ? 'text-[#9ca3af]' : 'text-[color:var(--primary)]'"
          />
          <span
            class="text-[26px] font-medium leading-none whitespace-nowrap"
            :class="coupon.disabled ? 'text-[#6b7280]' : 'text-[color:var(--primary)]'"
          >{{ coupon.discount }}</span>
        </div>

        <!-- Right: coupon info -->
        <div class="flex flex-col gap-2 py-2 flex-1 min-w-0">
          <p
            class="font-semibold text-[18px] leading-snug"
            :class="coupon.disabled ? 'text-[#64748b]' : 'text-[#334155]'"
          >{{ coupon.name }}</p>
          <p class="text-sm text-[#64748b]">{{ coupon.description }}</p>
          <span
            class="inline-flex items-center px-[7px] py-[3.5px] rounded-full text-[12px] font-bold w-fit"
            :class="{
              'bg-[#fee2e2] text-[#b91c1c]': coupon.tagType === 'danger',
              'bg-[#e0f2fe] text-[#0369a1]': coupon.tagType === 'info',
              'bg-[#f1f5f9] text-[#475569]': coupon.tagType === 'secondary',
            }"
          >{{ coupon.tagText }}</span>
          <p class="text-sm text-[#64748b]">{{ coupon.expiry }}</p>
        </div>
      </div>
    </div>
  </Drawer>
</template>
