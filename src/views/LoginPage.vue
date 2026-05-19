<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUiStore } from '../stores/ui'

declare global {
  interface Window {
    grecaptcha?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => number
      reset: (id?: number) => void
      ready: (cb: () => void) => void
    }
    __recaptchaOnLoad?: () => void
  }
}

// Google's official test sitekey — replace with your real key in production.
// Docs: https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha
const RECAPTCHA_SITEKEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
const RECAPTCHA_SCRIPT_ID = 'recaptcha-v2-script'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

function socialLogin(provider: string) {
  auth.login()
  ui.toast(`已使用 ${provider} 登入`)
  router.push('/')
}

const countryCode = ref('+886')
const phone = ref('')
const password = ref('')
const passwordVisible = ref(false)
const captchaToken = ref('')
const agreed = ref(false)
const submitted = ref(false)

const recaptchaContainer = ref<HTMLElement | null>(null)
let widgetId: number | null = null

const canSubmit = computed(() => agreed.value && !!phone.value && !!password.value && !!captchaToken.value)

function renderWidget() {
  if (!window.grecaptcha || !recaptchaContainer.value || widgetId !== null) return
  widgetId = window.grecaptcha.render(recaptchaContainer.value, {
    sitekey: RECAPTCHA_SITEKEY,
    callback: (token: string) => { captchaToken.value = token },
    'expired-callback': () => { captchaToken.value = '' },
    'error-callback': () => { captchaToken.value = '' },
  })
}

onMounted(() => {
  if (window.grecaptcha?.render) {
    window.grecaptcha.ready(renderWidget)
    return
  }
  window.__recaptchaOnLoad = () => window.grecaptcha?.ready(renderWidget)
  if (!document.getElementById(RECAPTCHA_SCRIPT_ID)) {
    const s = document.createElement('script')
    s.id = RECAPTCHA_SCRIPT_ID
    s.src = 'https://www.google.com/recaptcha/api.js?onload=__recaptchaOnLoad&render=explicit'
    s.async = true
    s.defer = true
    document.head.appendChild(s)
  }
})

onBeforeUnmount(() => {
  if (widgetId !== null && window.grecaptcha) window.grecaptcha.reset(widgetId)
  delete window.__recaptchaOnLoad
})

function onSubmit() {
  submitted.value = true
  if (!canSubmit.value) return
  auth.login()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen relative overflow-hidden" style="background: var(--surface-100)">
    <!-- Decorative background blob -->
    <div class="login-bg" aria-hidden="true"></div>

    <!-- Top bar -->
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
          @click="router.push('/help')"
        >
          需要幫助
          <i class="pi pi-question-circle text-sm" />
        </button>
      </div>
    </header>

    <!-- Main content -->
    <main class="relative z-10 px-4 py-[52px]">
      <div class="max-w-[1280px] mx-auto flex flex-col @lg:flex-row items-center justify-center gap-12 @4xl:gap-[113px]">
        <!-- Left: welcome + illustration -->
        <div class="flex flex-col items-center gap-[41px] shrink-0">
          <h1 class="text-[24px] @3xl:text-[26px] @4xl:text-[36px] font-bold text-center leading-tight whitespace-nowrap" style="color: var(--surface-950)">
            歡迎光臨！<br>直播好康等你來逛
          </h1>
          <img
            src="/login-illustration.png"
            alt="直播購物插圖"
            class="hidden @3xl:block @3xl:w-[200px] @4xl:w-[476px] max-w-full h-auto select-none pointer-events-none"
            draggable="false"
          />
        </div>

        <!-- Right: login card -->
        <div class="bg-white rounded-2xl p-7 w-full max-w-[440px] flex flex-col gap-[14px] items-center"
             style="box-shadow: 0 2px 6px rgba(0,0,0,0.15)">
          <h2 class="text-[28px] font-bold text-center" style="color: var(--surface-950)">登入</h2>

          <form class="w-full flex flex-col gap-[14px]" @submit.prevent="onSubmit">
            <!-- Country code + phone -->
            <div class="flex gap-[10px] items-start">
              <div class="flex flex-col gap-[7px] w-[118px]">
                <label class="text-sm" style="color: var(--surface-700)">國碼</label>
                <div class="relative">
                  <select
                    v-model="countryCode"
                    class="appearance-none w-full h-[33px] pl-[10.5px] pr-[35px] py-[7px] text-sm rounded-[6px] border border-[#cbd5e1] bg-white outline-none focus:border-[var(--primary)] transition-colors"
                    style="color: var(--surface-700); box-shadow: 0 1px 1px rgba(18,18,23,0.05)"
                  >
                    <option value="+886">+886</option>
                    <option value="+852">+852</option>
                    <option value="+853">+853</option>
                    <option value="+86">+86</option>
                  </select>
                  <i class="pi pi-chevron-down absolute right-[10px] top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] pointer-events-none" />
                </div>
              </div>
              <div class="flex-1 flex flex-col gap-[7px]">
                <label class="text-sm" style="color: var(--surface-700)">電話號碼</label>
                <div class="flex items-center gap-[10.5px] px-[11.5px] py-[8px] rounded-[6px] border border-[#cbd5e1] bg-white focus-within:border-[var(--primary)] transition-colors"
                     style="box-shadow: 0 1px 1px rgba(18,18,23,0.05)">
                  <input
                    v-model="phone"
                    type="tel"
                    placeholder="請輸入您的電話號碼"
                    class="flex-1 text-sm outline-none bg-transparent placeholder-[var(--text-muted)]"
                    style="color: var(--surface-700)"
                  />
                  <i class="pi pi-phone text-sm text-[var(--surface-700)]" />
                </div>
              </div>
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-[7px]">
              <label class="text-sm" style="color: var(--surface-700)">密碼</label>
              <div class="flex items-center gap-[10.5px] px-[11.5px] py-[8px] rounded-[6px] border border-[#cbd5e1] bg-white focus-within:border-[var(--primary)] transition-colors"
                   style="box-shadow: 0 1px 1px rgba(18,18,23,0.05)">
                <input
                  v-model="password"
                  :type="passwordVisible ? 'text' : 'password'"
                  placeholder="請輸入您的密碼"
                  class="flex-1 text-sm outline-none bg-transparent placeholder-[var(--text-muted)]"
                  style="color: var(--surface-700)"
                />
                <button
                  type="button"
                  class="text-[var(--surface-700)] flex items-center"
                  @click="passwordVisible = !passwordVisible"
                  :aria-label="passwordVisible ? '隱藏密碼' : '顯示密碼'"
                >
                  <i :class="['pi', passwordVisible ? 'pi-eye' : 'pi-eye-slash', 'text-sm']" />
                </button>
              </div>
              <a class="self-end text-base underline cursor-pointer" style="color: var(--primary)" @click="router.push('/forgot')">忘記密碼</a>
            </div>

            <!-- reCaptcha -->
            <div class="flex flex-col gap-[7px]">
              <label class="text-sm" style="color: var(--surface-700)">驗證碼</label>
              <div ref="recaptchaContainer" class="recaptcha-host"></div>
              <p v-if="submitted && !captchaToken" class="text-sm" style="color: #ef4444">
                請先完成人機驗證
              </p>
            </div>

            <!-- Terms agreement -->
            <div class="flex gap-[7px] items-start">
              <label class="relative inline-flex items-center cursor-pointer mt-[2px] shrink-0">
                <input
                  v-model="agreed"
                  type="checkbox"
                  class="appearance-none w-[17.5px] h-[17.5px] rounded-[4px] border border-[#cbd5e1] bg-white checked:bg-[var(--primary)] checked:border-[var(--primary)] transition-colors"
                />
                <i v-if="agreed" class="pi pi-check text-white text-[10px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
              </label>
              <div class="flex flex-col gap-2 flex-1">
                <p class="text-base leading-[1.4]" style="color: var(--surface-700)">
                  我同意直播管家購物小幫手
                  <a class="underline cursor-pointer" style="color: var(--primary)" @click="router.push('/terms')">服務政策</a>
                  與
                  <a class="underline cursor-pointer" style="color: var(--primary)" @click="router.push('/privacy')">隱私權政策</a>
                </p>
                <p v-if="submitted && !agreed" class="text-base" style="color: #ef4444">
                  為保障您的權益，請先同意服務條款與隱私政策
                </p>
              </div>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              :disabled="!canSubmit"
              class="w-full py-[14px] rounded-[6px] text-[16px] font-medium text-[#f0f4f7] transition-colors mt-1"
              :style="canSubmit
                ? 'background: var(--primary-bg); cursor: pointer'
                : 'background: #949494; cursor: not-allowed'"
              @mouseover="canSubmit && (($event.target as HTMLElement).style.background = 'var(--primary-hover-bg)')"
              @mouseleave="canSubmit && (($event.target as HTMLElement).style.background = 'var(--primary-bg)')"
            >
              使用電話號碼登入
            </button>
          </form>

          <!-- Divider -->
          <div class="flex items-center gap-4 w-full">
            <div class="flex-1 h-px bg-[var(--border-light)]"></div>
            <span class="text-base whitespace-nowrap" style="color: var(--text-muted)">或透過以下方式快速登入</span>
            <div class="flex-1 h-px bg-[var(--border-light)]"></div>
          </div>

          <!-- Social login -->
          <div class="w-full flex flex-col gap-[10px]">
            <button class="social-btn" @click="socialLogin('Facebook')">
              <i class="pi pi-facebook text-[22px]" style="color: #1877f2" />
              <span>Facebook</span>
            </button>
            <button class="social-btn" @click="socialLogin('Google')">
              <span class="google-icon" aria-hidden="true">G</span>
              <span>Google</span>
            </button>
            <button class="social-btn" @click="socialLogin('Line')">
              <span class="line-icon" aria-hidden="true">LINE</span>
              <span>Line</span>
            </button>
            <button class="social-btn" @click="socialLogin('Tiktok')">
              <i class="pi pi-tiktok text-[22px]" />
              <span>Tiktok</span>
            </button>
          </div>

          <p class="text-base text-center" style="color: var(--text-muted)">
            尚未建立帳戶，即刻
            <a class="underline cursor-pointer ml-1" style="color: var(--primary)" @click="router.push('/register')">註冊</a>
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 30% 35%, rgba(112, 8, 231, 0.55) 0%, rgba(112, 8, 231, 0) 38%),
    radial-gradient(circle at 65% 70%, rgba(96, 165, 250, 0.45) 0%, rgba(96, 165, 250, 0) 40%);
  filter: blur(10px);
}

.recaptcha-host {
  min-height: 78px;
}
.recaptcha-host :deep(> div) {
  width: 100% !important;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 9px 24px;
  border-radius: 6px;
  border: 1px solid var(--surface-700);
  background: white;
  color: var(--surface-700);
  font-weight: 700;
  font-size: 15px;
  transition: background-color 0.15s;
  cursor: pointer;
}
.social-btn:hover {
  background: #f8fafc;
}

.google-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: conic-gradient(from -45deg, #ea4335 0deg 90deg, #fbbc05 90deg 180deg, #34a853 180deg 270deg, #4285f4 270deg 360deg);
  color: white;
  font-weight: 700;
  font-size: 12px;
  line-height: 1;
}

.line-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: #06c755;
  color: white;
  font-weight: 800;
  font-size: 8px;
  line-height: 1;
}
</style>
