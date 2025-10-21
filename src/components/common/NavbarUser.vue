<template>
  <nav class="navbar navbar-expand-lg navbar-dark" style="background-color:#00b14f;">
    <div class="container">
      <router-link to="/" class="navbar-brand fw-bold">GrabFood</router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
              aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-lg-center">

          <!-- Chưa đăng nhập -->
          <template v-if="!isLoggedIn">
            <li class="nav-item">
              <!-- CHÚ Ý: dùng '/login' (chữ thường) để trùng router -->
              <router-link class="nav-link fw-semibold text-white" to="/login">Đăng nhập</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/register" class="nav-link fw-semibold text-white">Đăng ký</router-link>
            </li>
          </template>

          <!-- Đã đăng nhập -->
          <template v-else>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle fw-semibold text-white" href="#"
                 role="button" data-bs-toggle="dropdown" aria-expanded="false">
                {{ user?.name || 'Tài khoản' }} <small class="opacity-75">({{ role }})</small>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li v-if="role === 'admin'">
                  <router-link class="dropdown-item" to="/admin">Trang quản trị</router-link>
                </li>
                <li>
                  <router-link class="dropdown-item" to="/">Trang người dùng</router-link>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button class="dropdown-item" @click="logout">Đăng xuất</button>
                </li>
              </ul>
            </li>
          </template>

        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

const isLoggedIn = computed(() => !!user.value)
const role = computed(() => user.value?.role || 'guest')

// Đồng bộ khi login/logout ở tab khác
const syncUser = () => {
  try {
    user.value = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    user.value = null
  }
}
onMounted(() => window.addEventListener('storage', syncUser))
onUnmounted(() => window.removeEventListener('storage', syncUser))

// ĐĂNG XUẤT: chọn 1 trong 2 cách (SPA hoặc reload cứng)
const logout = () => {
  localStorage.removeItem('user')
  user.value = null
  // Cách A: SPA (mượt, giữ state app)
  router.replace('/login')
  // Cách B: Reload cứng (giống code bạn đang dùng)
  // window.location.href = '/'
}
</script>

<style scoped>
body { background-color: #f7f7f7; }
.navbar { background-color: #00b14f; }
.btn-brand { background-color: #00b14f; color: #fff; }
.btn-brand:hover { background-color: #009944; color: #fff; }
.search-box { max-width: 600px; margin: auto; }
.category-img { border-radius: 8px; transition: transform 0.2s; }
.category-img:hover { transform: scale(1.05); }
</style>
