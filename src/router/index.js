// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

import LayoutsUser from '@/components/layouts/LayoutsUser.vue'
import HomeView from '@/views/user/HomeView.vue'
import RestaurantListView from '@/views/user/RestaurantListView.vue'
import CategoryView from '@/views/user/CategoryView.vue'
import ProductListUserView from '@/views/user/ProductListUserView.vue'

import LayoutsAdmin from '@/components/layouts/LayoutsAdmin.vue'
import DashboardView from '@/views/admin/DashboardView.vue'
import UserView from '@/views/admin/UserView.vue'
import ProfileView from '@/views/admin/ProfileView.vue'
import ProductsView from '@/views/admin/ProductsView.vue'

import Login from '@/views/auth/Login.vue'
import Register from '@/views/auth/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ================= USER =================
    {
      path: '/',
      component: LayoutsUser,
      // Nếu muốn bắt buộc đăng nhập cho một số trang user → thêm meta ở từng child
      children: [
        {
          path: '',
          name: 'home',
          component: HomeView
        },
        {
          path: 'restaurant/:id',
          name: 'restaurant',
          component: RestaurantListView
        },
        {
          path: 'category',
          name: 'cate',
          component: CategoryView
        },
        {
          // Giữ nguyên tên path bạn đang dùng (nếu gõ nhầm thì đổi cả link cho đồng bộ)
          path: 'produclist',
          name: 'products',
          component: ProductListUserView
        }
      ]
    },

    // ================= ADMIN =================
    {
      path: '/admin',
      component: LayoutsAdmin,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardView
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: DashboardView
        },
        {
          path: 'products',
          name: 'admin.products',
          component: ProductsView
        },
        {
          path: 'users',
          name: 'admin.users',
          component: UserView
        },
        {
          path: 'profile',
          name: 'admin.profile',
          component: ProfileView
        }
      ]
    },

    // ================= AUTH =================
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { public: true }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { public: true }
    },

    // ================= FALLBACK =================
    // { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

// // ============ GLOBAL GUARD (role-based) ============
// router.beforeEach((to, from, next) => {
//   const user = JSON.parse(localStorage.getItem('user') || 'null')

//   // Trang public: cho vào luôn
//   if (to.matched.some(r => r.meta?.public)) {
//     // Nếu đã đăng nhập mà cố vào /login hoặc /register -> đẩy về đúng trang theo role
//     if ((to.name === 'login' || to.name === 'register') && user) {
//       return next(user.role === 'admin' ? { name: 'admin.dashboard' } : { name: 'home' })
//     }
//     return next()
//   }

//   // Yêu cầu đăng nhập?
//   if (to.matched.some(r => r.meta?.requiresAuth) && !user) {
//     alert('Vui lòng đăng nhập để tiếp tục!')
//     localStorage.setItem('redirectAfterLogin', to.fullPath)
//     return next({ name: 'login' })
//   }

//   // Yêu cầu admin?
//   if (to.matched.some(r => r.meta?.requiresAdmin) && user?.role !== 'admin') {
//     alert('Bạn không có quyền truy cập trang này!')
//     return next(user ? { name: 'home' } : { name: 'login' })
//   }

//   // Nếu đã đăng nhập mà chuyển vào /login (do link tay) -> đưa về đúng home theo role
//   if ((to.name === 'login' || to.name === 'register') && user) {
//     return next(user.role === 'admin' ? { name: 'admin.dashboard' } : { name: 'home' })
//   }

//   next()
// })

export default router
