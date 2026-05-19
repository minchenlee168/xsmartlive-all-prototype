<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const countryCode = ref('+886')
const phone = ref('')
const name = ref('')
const password = ref('')
const confirm = ref('')
const agreed = ref(false)
const submitted = ref(false)

const passwordMismatch = computed(() => !!confirm.value && password.value !== confirm.value)
const canSubmit = computed(() =>
  !!phone.value && !!name.value && !!password.value &&
  !passwordMismatch.value && agreed.value
)

function onSubmit() {
  submitted.value = true
  if (!canSubmit.value) return
  auth.login(name.value)
  ui.toast('註冊成功，已自動登入')
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen relative overflow-hidden" style="background: var(--surface-100)">
    <header class="relative z-10 bg-white border-b border-[var(--border-light)]">
      <div class="max-w-[1280px] mx-auto flex items-center justify-between px-8 py-2 h-[57px]">
        <button class="flex items-center gap-2 shrink-0" @click="router.push('/')">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: var(--primary-bg)">
            <span class="text-white font-bold text-base">X</span>
          </div>
          <span class="font-bold text-xl leading-tight" style="color: var(--primary)">
            <span class="opacity-90">xSmart</span><span>Live</span>
          </span>
        </button>
        <button
          class="flex items-center gap-1.5 px-[10.5px] py-[7px] rounded-[6px] hover:bg-gray-100 text-[var(--surface-700)] text-base font-medium"
          @click="router.push('/login')"
        >
          已有帳號？登入
        </button>
      </div>
    </header>

    <main class="relative z-10 px-4 py-[52px] flex justify-center">
      <div class="bg-white rounded-2xl p-8 w-full max-w-[440px] flex flex-col gap-[18px]"
           style="box-shadow: 0 2px 6px rgba(0,0,0,0.15)">
        <h2 class="text-[28px] font-bold text-center" style="color: var(--surface-950)">註冊新帳號</h2>

        <form class="flex flex-col gap-[18px]" @submit.prevent="onSubmit">
          <div class="flex gap-[10px] items-start">
            <div class="flex flex-col gap-[7px] w-[118px]">
              <label class="text-sm" style="color: var(--surface-700)">國碼</label>
              <select
                v-model="countryCode"
                class="h-[40px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] bg-white outline-none focus:border-[var(--primary)] transition-colors"
                style="color: var(--surface-700)"
              >
                <option value="+886">+886</option>
                <option value="+852">+852</option>
                <option value="+86">+86</option>
              </select>
            </div>
            <div class="flex-1 flex flex-col gap-[7px]">
              <label class="text-sm" style="color: var(--surface-700)">電話號碼<span style="color:#ef4444"> *</span></label>
              <input
                v-model="phone"
                type="tel"
                placeholder="請輸入您的電話號碼"
                class="h-[40px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] transition-colors bg-white"
                style="color: var(--surface-700)"
              />
            </div>
          </div>

          <div class="flex flex-col gap-[7px]">
            <label class="text-sm" style="color: var(--surface-700)">姓名<span style="color:#ef4444"> *</span></label>
            <input
              v-model="name"
              type="text"
              placeholder="請輸入您的姓名"
              class="h-[40px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] transition-colors bg-white"
              style="color: var(--surface-700)"
            />
          </div>

          <div class="flex flex-col gap-[7px]">
            <label class="text-sm" style="color: var(--surface-700)">密碼<span style="color:#ef4444"> *</span></label>
            <input
              v-model="password"
              type="password"
              placeholder="請設定您的密碼"
              class="h-[40px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] transition-colors bg-white"
              style="color: var(--surface-700)"
            />
          </div>

          <div class="flex flex-col gap-[7px]">
            <label class="text-sm" style="color: var(--surface-700)">確認密碼<span style="color:#ef4444"> *</span></label>
            <input
              v-model="confirm"
              type="password"
              placeholder="請再次輸入密碼"
              class="h-[40px] px-3 text-sm rounded-[6px] border outline-none transition-colors bg-white"
              :style="passwordMismatch ? 'border-color:#ef4444; color: var(--surface-700)' : 'border-color:#cbd5e1; color: var(--surface-700)'"
            />
            <p v-if="passwordMismatch" class="text-sm" style="color:#ef4444">兩次密碼輸入不一致</p>
          </div>

          <label class="flex items-start gap-2 cursor-pointer">
            <input v-model="agreed" type="checkbox" class="mt-1 w-[17px] h-[17px] accent-[var(--primary)]" />
            <span class="text-sm" style="color: var(--surface-700)">
              我同意直播管家購物小幫手
              <a class="underline cursor-pointer" style="color: var(--primary)" @click.prevent="router.push('/terms')">服務政策</a>
              與
              <a class="underline cursor-pointer" style="color: var(--primary)" @click.prevent="router.push('/privacy')">隱私權政策</a>
            </span>
          </label>
          <p v-if="submitted && !agreed" class="text-sm -mt-2" style="color:#ef4444">請先同意服務條款與隱私政策</p>

          <button
            type="submit"
            :disabled="!canSubmit"
            class="w-full py-[14px] rounded-[6px] text-[16px] font-medium text-[#f0f4f7] transition-colors mt-1"
            :style="canSubmit ? 'background: var(--primary-bg); cursor:pointer' : 'background:#949494; cursor:not-allowed'"
          >
            建立帳號
          </button>
        </form>
      </div>
    </main>
  </div>
</template>
