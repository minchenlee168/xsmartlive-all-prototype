<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const countryCodes = ['+886', '+852', '+86']
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
      <div class="max-w-[1280px] mx-auto flex items-center justify-between px-8 py-2 h-14">
        <button class="flex items-center gap-2 shrink-0" @click="router.push('/')">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background: var(--primary-bg)">
            <span class="text-white font-bold text-base">X</span>
          </div>
          <span class="font-bold text-xl leading-tight" style="color: var(--primary)">
            <span class="opacity-90">xSmart</span><span>Live</span>
          </span>
        </button>
        <Button label="已有帳號？登入" severity="secondary" text @click="router.push('/login')" />
      </div>
    </header>

    <main class="relative z-10 px-4 py-12 flex justify-center">
      <div class="bg-white rounded-2xl p-8 w-full max-w-[440px] flex flex-col gap-4"
           style="box-shadow: 0 2px 6px rgba(0,0,0,0.15)">
        <h2 class="text-[28px] font-bold text-center" style="color: var(--surface-950)">註冊新帳號</h2>

        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <div class="flex gap-2 items-start">
            <div class="flex flex-col gap-2 w-[118px]">
              <label class="text-base" style="color: var(--surface-700)">國碼</label>
              <Select v-model="countryCode" :options="countryCodes" class="w-full" />
            </div>
            <div class="flex-1 flex flex-col gap-2">
              <label class="text-base" style="color: var(--surface-700)">電話號碼<span style="color:#ef4444"> *</span></label>
              <InputText v-model="phone" type="tel" placeholder="請輸入您的電話號碼" class="w-full" />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-base" style="color: var(--surface-700)">姓名<span style="color:#ef4444"> *</span></label>
            <InputText v-model="name" placeholder="請輸入您的姓名" class="w-full" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-base" style="color: var(--surface-700)">密碼<span style="color:#ef4444"> *</span></label>
            <Password v-model="password" :feedback="false" toggle-mask placeholder="請設定您的密碼" fluid input-class="w-full" />
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-base" style="color: var(--surface-700)">確認密碼<span style="color:#ef4444"> *</span></label>
            <Password v-model="confirm" :feedback="false" toggle-mask :invalid="passwordMismatch" placeholder="請再次輸入密碼" fluid input-class="w-full" />
            <p v-if="passwordMismatch" class="text-sm" style="color:#ef4444">兩次密碼輸入不一致</p>
          </div>

          <label class="flex items-start gap-2 cursor-pointer">
            <Checkbox v-model="agreed" binary input-id="reg-agree" class="mt-1" />
            <span class="text-base" style="color: var(--surface-700)">
              我同意直播管家購物小幫手
              <a class="underline cursor-pointer" style="color: var(--primary)" @click.prevent="router.push('/terms')">服務政策</a>
              與
              <a class="underline cursor-pointer" style="color: var(--primary)" @click.prevent="router.push('/privacy')">隱私權政策</a>
            </span>
          </label>
          <p v-if="submitted && !agreed" class="text-sm -mt-2" style="color:#ef4444">請先同意服務條款與隱私政策</p>

          <Button type="submit" :disabled="!canSubmit" label="建立帳號" class="w-full mt-1 !min-h-[48px]" />
        </form>
      </div>
    </main>
  </div>
</template>
