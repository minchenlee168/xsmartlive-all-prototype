<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUiStore } from '../stores/ui'

const router = useRouter()
const ui = useUiStore()

const method = ref<'phone' | 'email'>('phone')
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
          返回登入
        </button>
      </div>
    </header>

    <main class="relative z-10 px-4 py-[52px] flex justify-center">
      <div class="bg-white rounded-2xl p-8 w-full max-w-[440px] flex flex-col gap-5"
           style="box-shadow: 0 2px 6px rgba(0,0,0,0.15)">
        <div class="text-center">
          <h2 class="text-[28px] font-bold" style="color: var(--surface-950)">忘記密碼</h2>
          <p class="text-sm mt-1" style="color: var(--text-muted)">輸入註冊時的手機或 Email 取得重設驗證碼</p>
        </div>

        <!-- Method tabs -->
        <div class="flex border border-[#cbd5e1] rounded-[6px] overflow-hidden text-sm">
          <button
            class="flex-1 py-2 transition-colors"
            :style="method === 'phone' ? 'background: var(--primary-bg); color:white' : 'color:#334155'"
            @click="method = 'phone'"
          >手機號碼</button>
          <button
            class="flex-1 py-2 transition-colors"
            :style="method === 'email' ? 'background: var(--primary-bg); color:white' : 'color:#334155'"
            @click="method = 'email'"
          >Email</button>
        </div>

        <div v-if="method === 'phone'" class="flex gap-2">
          <select
            v-model="countryCode"
            class="h-[40px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] bg-white outline-none focus:border-[var(--primary)] w-[100px] text-[#334155]"
          >
            <option value="+886">+886</option>
            <option value="+852">+852</option>
          </select>
          <input
            v-model="phone"
            type="tel"
            placeholder="請輸入手機號碼"
            class="flex-1 h-[40px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] text-[#334155]"
          />
        </div>
        <input
          v-else
          v-model="email"
          type="email"
          placeholder="請輸入 Email"
          class="h-[40px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] text-[#334155]"
        />

        <button
          :disabled="!canSend"
          class="w-full py-[12px] rounded-[6px] text-sm font-medium transition-colors"
          :style="canSend ? 'background: var(--primary-bg); color:white; cursor:pointer' : 'background:#cbd5e1; color:white; cursor:not-allowed'"
          @click="sendCode"
        >
          {{ sent ? '重新發送驗證碼' : '發送驗證碼' }}
        </button>

        <template v-if="sent">
          <div class="border-t border-[#e2e8f0] pt-4 flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm text-[#334155]">驗證碼</label>
              <input
                v-model="code"
                type="text"
                maxlength="6"
                placeholder="請輸入六位數驗證碼"
                class="h-[40px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] text-[#334155]"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm text-[#334155]">新密碼</label>
              <input
                v-model="newPassword"
                type="password"
                placeholder="至少 6 碼"
                class="h-[40px] px-3 text-sm rounded-[6px] border border-[#cbd5e1] outline-none focus:border-[var(--primary)] text-[#334155]"
              />
            </div>
            <button
              :disabled="!canReset"
              class="w-full py-[12px] rounded-[6px] text-sm font-medium transition-colors"
              :style="canReset ? 'background: var(--primary-bg); color:white; cursor:pointer' : 'background:#cbd5e1; color:white; cursor:not-allowed'"
              @click="resetPassword"
            >
              重設密碼
            </button>
          </div>
        </template>
      </div>
    </main>
  </div>
</template>
