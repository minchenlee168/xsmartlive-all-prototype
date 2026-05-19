<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useViewportStore } from '../stores/viewport'
import { useCartStore } from '../stores/cart'

const props = defineProps<{
  id: number
  name: string
  price: number
  original: number
  hasVariant?: boolean
  stock?: number
  image?: string
}>()

const router = useRouter()
const cart = useCartStore()

const qty = ref(1)
const vp = computed(() => useViewportStore().current.id)
const isPC = computed(() => vp.value === 'pc')

function onPrimaryAction(e: MouseEvent) {
  e.stopPropagation()
  if (props.hasVariant) {
    router.push(`/product/${props.id}`)
  } else {
    cart.addItem({ id: props.id, name: props.name, price: props.price, original: props.original, image: props.image }, '預設', qty.value)
  }
}
</script>

<template>
  <div
    class="bg-white rounded-[12px] shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_rgba(0,0,0,0.06)] flex flex-col w-full cursor-pointer hover:shadow-md transition-shadow"
    :class="isPC ? 'gap-[0.4375rem] p-[0.5rem]' : 'gap-[0.3125rem] p-[0.5rem]'"
    @click="router.push(`/product/${props.id}`)"
  >
    <!-- Product image -->
    <div class="aspect-[332/320] w-full bg-gray-100 overflow-hidden" :class="isPC ? 'rounded-[8px]' : 'rounded-[6px]'">
      <img v-if="image" :src="image" :alt="name" class="w-full h-full object-cover" />
      <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
        <i class="pi pi-image" :class="isPC ? 'text-4xl' : 'text-3xl'" />
      </div>
    </div>

    <!-- Product info -->
    <div class="flex flex-col flex-1 px-1 pt-1" :class="isPC ? 'gap-2 px-2 pt-2' : 'gap-1'">
      <!-- Title -->
      <p class="text-[#020617] font-medium leading-normal line-clamp-2 text-[1rem]">
        {{ name }}
      </p>

      <!-- Price -->
      <div class="flex flex-col" :class="isPC ? 'gap-1' : 'gap-0.5'">
        <span class="text-[#64748b] line-through" :class="isPC ? 'text-base' : 'text-[10px]'">NTD ${{ original }}</span>
        <span class="text-[#f43f5e] font-semibold" :class="isPC ? 'text-2xl' : 'text-sm'">
          <span class="text-[0.75rem] font-normal">NTD</span> ${{ price }}
        </span>
      </div>

      <!-- Quantity + CTA -->
      <div class="flex flex-col mt-auto" :class="isPC ? 'gap-2' : 'gap-1'">
        <!-- Quantity selector -->
        <div v-if="!hasVariant" class="flex flex-col" :class="isPC ? 'gap-1' : 'gap-1'">
          <div class="flex items-center" :class="isPC ? 'gap-4' : 'gap-2'">
            <span class="text-[#334155]" :class="isPC ? 'text-sm' : 'text-[11px]'">數量</span>
            <div class="flex items-center">
              <button
                class="border border-[#cbd5e1] flex items-center justify-center hover:bg-gray-50 transition-colors"
                :class="isPC ? 'w-[35px] h-[34px] rounded-l-[6px]' : 'w-[26px] h-[26px] rounded-l-[4px]'"
                @click="qty > 1 && qty--"
              >
                <i class="pi pi-minus text-[#334155]" :class="isPC ? 'text-xs' : 'text-[9px]'" />
              </button>
              <input
                v-model="qty"
                type="number"
                class="border-y border-[#cbd5e1] text-center text-[#334155] outline-none bg-white"
                :class="isPC ? 'w-[48px] h-[34px] text-sm' : 'w-[36px] h-[26px] text-[11px]'"
              />
              <button
                class="border border-[#cbd5e1] flex items-center justify-center hover:bg-gray-50 transition-colors"
                :class="isPC ? 'w-[35px] h-[34px] rounded-r-[6px]' : 'w-[26px] h-[26px] rounded-r-[4px]'"
                @click="qty++"
              >
                <i class="pi pi-plus text-[#334155]" :class="isPC ? 'text-xs' : 'text-[9px]'" />
              </button>
            </div>
          </div>
          <span class="text-[#334155]" :class="isPC ? 'text-sm' : 'text-[10px]'">還剩{{ stock ?? 11 }}件</span>
        </div>

        <!-- CTA Button -->
        <button
          class="w-full flex items-center justify-center font-medium transition-colors"
          :class="isPC
            ? 'gap-[7px] px-[13.25px] py-[9.75px] rounded-[6px] text-[15.75px]'
            : 'gap-[5px] px-2 py-[6px] rounded-[4px] text-[11px]'"
          :style="hasVariant
            ? { border: '1px solid var(--primary-200)', color: 'var(--primary)', background: 'transparent' }
            : { background: 'var(--primary-bg)', border: '1px solid var(--primary)', color: '#fff' }"
          @mouseover="(e) => { (e.currentTarget as HTMLElement).style.background = hasVariant ? 'color-mix(in srgb, var(--primary) 8%, transparent)' : 'var(--primary-hover-bg)' }"
          @mouseleave="(e) => { (e.currentTarget as HTMLElement).style.background = hasVariant ? 'transparent' : 'var(--primary-bg)' }"
          @click="onPrimaryAction"
        >
          <i v-if="!hasVariant" class="pi pi-cart-plus" :class="isPC ? 'text-sm' : 'text-[10px]'" />
          {{ hasVariant ? '選擇規格' : '加入購物車' }}
          <i v-if="hasVariant" class="pi pi-reply" :class="isPC ? 'text-sm' : 'text-[10px]'" />
        </button>
      </div>
    </div>
  </div>
</template>
