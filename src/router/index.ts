import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import AdminApp from '../admin/AdminApp.vue'
import {
  adminChildRoutes,
  lotteryFullscreenRoutes,
  RouteName as AdminRouteName,
  registerTitleGuard,
} from '../admin/router'
import HomePage from '../views/HomePage.vue'
import ThemeHallPage from '../views/ThemeHallPage.vue'
import CategoryPage from '../views/CategoryPage.vue'
import ProductDetailPage from '../views/ProductDetailPage.vue'
import CartPage from '../views/CartPage.vue'
import LoginPage from '../views/LoginPage.vue'
import CheckoutPage from '../views/CheckoutPage.vue'
import SearchPage from '../views/SearchPage.vue'
import MemberCenterPage from '../views/MemberCenterPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import ForgotPasswordPage from '../views/ForgotPasswordPage.vue'
import InfoPage from '../views/InfoPage.vue'
import { useUiStore } from '../stores/ui'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: LandingPage },
    {
      path: '/admin',
      component: AdminApp,
      redirect: { name: AdminRouteName.LiveOrder },
      children: adminChildRoutes,
    },
    // 直播大螢幕抽獎頁（全螢幕、無 admin 殼層）
    ...lotteryFullscreenRoutes,
    { path: '/shop', component: HomePage },
    { path: '/theme', component: ThemeHallPage },
    { path: '/category/:tab', component: CategoryPage },
    { path: '/product/:id', component: ProductDetailPage },
    { path: '/cart', component: CartPage },
    { path: '/checkout', component: CheckoutPage },
    { path: '/search', component: SearchPage },
    { path: '/member', component: MemberCenterPage },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/forgot', component: ForgotPasswordPage },
    { path: '/terms', component: InfoPage },
    { path: '/privacy', component: InfoPage },
    { path: '/help', component: InfoPage },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

// 需登入才能進入的頁面
const AUTH_REQUIRED = ['/cart', '/checkout']

// 換頁 loading：切換路徑時顯示載入畫面，最少顯示一小段時間才看得到
let loadingTimer: ReturnType<typeof setTimeout> | null = null
router.beforeEach((to, from) => {
  // 未登入時，購物車／結帳導向登入頁（並記住目的地）
  if (AUTH_REQUIRED.includes(to.path) && !useAuthStore().isLoggedIn) {
    useUiStore().toast('請先登入會員')
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  if (to.path !== from.path) {
    if (loadingTimer) clearTimeout(loadingTimer)
    useUiStore().setRouteLoading(true)
  }
  return true
})
router.afterEach(() => {
  if (loadingTimer) clearTimeout(loadingTimer)
  loadingTimer = setTimeout(() => useUiStore().setRouteLoading(false), 500)
})

// 後台路由切換時依 meta.i18nKey 更新 document.title
registerTitleGuard(router)

export default router
