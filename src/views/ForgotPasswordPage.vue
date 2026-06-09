<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const ui = useUiStore()

const method = ref<'phone' | 'email'>('phone')
const methodOptions = [
  { label: '手機號碼', value: 'phone' },
  { label: 'Email', value: 'email' },
]
const countryCodes = ['+886', '+852']
const countryCode = ref('+886')
const phone = ref('')
const email = ref('')
const sent = ref(false)
const code = ref('')
const newPassword = ref('')

const canSend = computed(() => method.value === 'phone' ? !!phone.value : !!email.value)
const canReset = computed(() => !!code.value && newPassword.value.length >= 6)

function sendCode() {
  if (!canSend.value) return
  sent.value = true
  ui.toast('重設驗證碼已發送（示意）')
}
function resetPassword() {
  if (!canReset.value) return
  ui.toast('密碼已重設，請使用新密碼登入')
  router.push('/login')
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
        <Button label="返回登入" severity="secondary" text @click="router.push('/login')" />
      </div>
    </header>

    <main class="relative z-10 px-4 py-12 flex justify-center">
      <div class="bg-white rounded-2xl p-8 w-full max-w-[440px] flex flex-col gap-4"
           style="box-shadow: 0 2px 6px rgba(0,0,0,0.15)">
        <div class="text-center">
          <h2 class="text-[28px] font-bold" style="color: var(--surface-950)">忘記密碼</h2>
          <p class="text-base mt-1" style="color: var(--text-muted)">輸入註冊時的手機或 Email 取得重設驗證碼</p>
        </div>

        <!-- Method tabs -->
        <SelectButton
          v-model="method"
          :options="methodOptions"
          option-label="label"
          option-value="value"
          :allow-empty="false"
          class="w-full"
        />

        <div v-if="method === 'phone'" class="flex gap-2">
          <Select v-model="countryCode" :options="countryCodes" class="w-[100px]" />
          <InputText v-model="phone" type="tel" placeholder="請輸入手機號碼" class="flex-1" />
        </div>
        <InputText
          v-else
          v-model="email"
          type="email"
          placeholder="請輸入 Email"
          class="w-full"
        />

        <Button
          :disabled="!canSend"
          :label="sent ? '重新發送驗證碼' : '發送驗證碼'"
          class="w-full !min-h-[48px]"
          @click="sendCode"
        />

        <template v-if="sent">
          <div class="border-t border-[#e2e8f0] pt-4 flex flex-col gap-4">
            <div class="flex flex-col gap-2">
              <label class="text-base text-[#334155]">驗證碼</label>
              <InputText v-model="code" maxlength="6" placeholder="請輸入六位數驗證碼" class="w-full" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-base text-[#334155]">新密碼</label>
              <Password v-model="newPassword" :feedback="false" toggle-mask placeholder="至少 6 碼" fluid input-class="w-full" />
            </div>
            <Button :disabled="!canReset" label="重設密碼" class="w-full !min-h-[48px]" @click="resetPassword" />
          </div>
        </template>
      </div>
    </main>
  </div>
</template>
