<!-- src/views/auth/Login.vue -->
<template>
  <div class="d-flex justify-content-center align-items-center vh-100 bg-success text-white">
    <div class="text-center w-100">
      <h1 class="fw-bold mb-4">GrabFood</h1>

      <div class="card shadow-sm border-0 mx-auto" style="max-width: 400px; width: 100%;">
        <div class="card-body p-4">
          <h4 class="fw-bold text-center mb-4 text-dark">Đăng nhập</h4>

          <form @submit.prevent="onSubmit">
            <div class="mb-3 text-start">
              <label for="email" class="form-label">Email</label>
              <input v-model.trim="email" type="email" class="form-control" id="email" placeholder="Nhập email" required />
            </div>

            <div class="mb-3 text-start">
              <label for="pwd" class="form-label">Mật khẩu</label>
              <input v-model.trim="pass" type="password" class="form-control" id="pwd" placeholder="Nhập mật khẩu" required />
            </div>

            <button :disabled="loading" type="submit" class="btn btn-success w-100">
              <span v-if="!loading">Đăng nhập</span>
              <span v-else>Đang kiểm tra…</span>
            </button>

            <p v-if="error" class="text-danger mt-3 mb-0">{{ error }}</p>
          </form>

          <div class="text-center mt-3">
            <a href="#" class="text-decoration-none">Quên mật khẩu?</a>
            <p class="mt-2 mb-0">
              Chưa có tài khoản?
              <router-link to="/register" class="text-decoration-none fw-semibold">Đăng ký</router-link>
            </p>
          </div>

          <div class="text-center mt-2">
            <router-link to="/" class="btn btn-outline-dark btn-sm">← Trang chủ</router-link>
          </div>

          <div class="text-muted small mt-3 text-start">
            <b>Demo:</b> admin@gmail.com / 1 (admin) &nbsp;|&nbsp; a@gmail.com / 123456 (user)
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const email = ref('')
const pass  = ref('')
const loading = ref(false)
const error = ref('')

const BASE_URL = 'http://localhost:3000'

const onSubmit = async () => {
  error.value = ''
  loading.value = true
  try {
    const url = `${BASE_URL}/employees?email=${encodeURIComponent(email.value)}&pass=${encodeURIComponent(pass.value)}&status=active`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Không thể kết nối máy chủ.')

    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Email/mật khẩu không đúng hoặc tài khoản chưa kích hoạt')
    }

    const user = data[0]
    localStorage.setItem('user', JSON.stringify(user))

    // Nếu guard đã lưu trang trước đó cần login
    const redirect = localStorage.getItem('redirectAfterLogin')
    if (redirect) {
      localStorage.removeItem('redirectAfterLogin')
      return router.replace(redirect)
    }

    // Điều hướng theo role (user -> '/', admin -> '/admin')
    return router.replace(user.role === 'admin' ? '/admin' : '/')
  } catch (e) {
    error.value = e.message || 'Đăng nhập thất bại'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
