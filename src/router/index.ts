import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
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

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
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
})
