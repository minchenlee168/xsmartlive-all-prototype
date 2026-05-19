<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{ close: [] }>()

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
    discount: '折300',
    name: '滿千折百優惠券（滿1000元使用）',
    description: '活動訂單滿 $1000 現折 $300',
    tagText: '適用範圍（直播場次）：我是直播場次-2025-12-24',
    tagType: 'danger',
    expiry: '有效期限至 2026.01.20 23:00',
  },
  {
    id: 2,
    discount: '50%',
    name: '滿千五折（滿1000元使用）',
    description: '活動訂單滿 $5000 打5折',
    tagText: '適用範圍(粉絲團貼文)：我是粉絲團貼文-2025-12-24',
    tagType: 'info',
    expiry: '有效期限至 2026.01.20 23:00',
  },
  {
    id: 3,
    discount: '折300',
    name: '滿千折三百（滿1000元使用）',
    description: '新客首單滿 $499 現折 $50',
    tagText: '適用範圍：全站',
    tagType: 'secondary',
    expiry: '有效期限至 2026.01.20 23:00',
    disabled: true,
  },
]

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}
onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div class="fixed inset-0 z-[200] flex items-end justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="emit('close')" />

        <!-- Panel -->
        <div class="panel relative z-10 w-full max-w-[680px] bg-white rounded-t-[12px] shadow-[0px_20px_25px_-5px_rgba(0,0,0,0.1),0px_8px_10px_-6px_rgba(0,0,0,0.1)] flex flex-col max-h-[80vh]">
          <!-- Header -->
          <div class="flex items-center justify-between px-[17.5px] py-[17.5px] shrink-0 border-b border-[#e2e8f0]">
            <span class="font-semibold text-[#334155] text-[21px] leading-normal">可使用優惠券</span>
            <button
              class="w-[35px] h-[35px] flex items-center justify-center rounded-[6px] hover:bg-gray-100 transition-colors"
              @click="emit('close')"
            >
              <i class="pi pi-times text-[#334155] text-sm" />
            </button>
          </div>

          <!-- Coupon list -->
          <div class="overflow-y-auto flex-1 px-[15.75px] pb-[15.75px]">
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
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-enter-active { transition: opacity 0.25s ease; }
.drawer-leave-active { transition: opacity 0.2s ease; }
.drawer-enter-active .panel { transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1); }
.drawer-leave-active .panel { transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1); }
.drawer-enter-from,
.drawer-leave-to { opacity: 0; }
.drawer-enter-from .panel,
.drawer-leave-to .panel { transform: translateY(100%); }
</style>
