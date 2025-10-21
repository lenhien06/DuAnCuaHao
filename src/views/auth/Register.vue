<!-- src/views/Register.vue -->
<template>
  <div class="d-flex justify-content vh-200 bg-success text-white">
    <div class="w-100">
      <h1 class="fw-bold mb-4 text-center">GrabFood</h1>

      <div class="card shadow-sm border-0 mx-auto text-dark" style="max-width: 400px; width: 100%;">
        <div class="card-body p-4">
          <h4 class="fw-bold mb-4 text-dark text-center">Đăng ký</h4>

          <form @submit.prevent="onSubmit">
            <div class="mb-3">
              <label for="hovaten" class="form-label">Họ và tên</label>
              <input v-model.trim="name" type="text" class="form-control" id="hovaten" placeholder="Nhập họ và tên" required />
            </div>

            <div class="mb-3">
              <label for="email" class="form-label">Email</label>
              <input v-model.trim="email" type="email" class="form-control" id="email" placeholder="Nhập email" required />
            </div>

            <div class="mb-3">
              <label for="sdt" class="form-label">Số điện thoại</label>
              <input v-model.trim="phone" type="text" class="form-control" id="sdt" placeholder="Nhập số điện thoại" />
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">Mật khẩu</label>
              <input v-model.trim="pass" type="password" class="form-control" id="password" placeholder="Nhập mật khẩu" required />
            </div>

            <div class="mb-3">
              <label for="confirm_password" class="form-label">Xác nhận mật khẩu</label>
              <input v-model.trim="confirm" type="password" class="form-control" id="confirm_password" placeholder="Xác nhận mật khẩu" required />
            </div>

            <!-- Giới tính (demo, không bắt buộc) -->
            <div class="mb-3 text-start">
              <label class="form-label">Giới tính</label><br />
              <div class="form-check form-check-inline">
                <input v-model="gender" class="form-check-input" type="radio" name="gioitinh" id="nam" value="Nam" />
                <label class="form-check-label" for="nam">Nam</label>
              </div>
              <div class="form-check form-check-inline">
                <input v-model="gender" class="form-check-input" type="radio" name="gioitinh" id="nu" value="Nữ" />
                <label class="form-check-label" for="nu">Nữ</label>
              </div>
            </div>

            <div class="form-check mb-3 text-start">
              <input v-model="agree" class="form-check-input" type="checkbox" id="terms" />
              <label class="form-check-label" for="terms">Tôi đồng ý với các điều khoản và điều kiện</label>
            </div>

            <button :disabled="loading" type="submit" class="btn btn-success w-100">
              <span v-if="!loading">Đăng ký</span>
              <span v-else>Đang xử lý…</span>
            </button>

            <p v-if="error" class="text-danger mt-3 mb-0">{{ error }}</p>
            <p v-if="success" class="text-success mt-3 mb-0">{{ success }}</p>
          </form>

          <div class="text-center mt-3">
            <p class="mt-2 mb-0">
              Bạn đã có tài khoản?
              <router-link to="/login" class="text-decoration-none fw-semibold">Đăng nhập</router-link>
            </p>
          </div>

          <div class="text-center mt-2">
            <router-link to="/" class="btn btn-outline-dark btn-sm">← Trang chủ</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const name = ref('')
const email = ref('')
const phone = ref('')
const pass = ref('')
const confirm = ref('')
const gender = ref('Nam')
const agree = ref(false)

const loading = ref(false)
const error = ref('')
const success = ref('')

const BASE_URL = 'http://localhost:3000'

const onSubmit = async () => {
  error.value = ''
  success.value = ''
  if (!agree.value) {
    error.value = 'Bạn cần đồng ý điều khoản.'
    return
  }
  if (pass.value !== confirm.value) {
    error.value = 'Mật khẩu xác nhận không khớp.'
    return
  }
  loading.value = true
  try {
    // Check trùng email
    const check = await fetch(`${BASE_URL}/employees?email=${encodeURIComponent(email.value)}`)
    const dup = await check.json()
    if (Array.isArray(dup) && dup.length > 0) {
      throw new Error('Email đã tồn tại.')
    }

    // Tạo user mới (role mặc định: user, status: active)
    const body = {
      name: name.value,
      email: email.value,
      phone: phone.value,
      pass: pass.value,
      status: 'active',
      role: 'user'
    }

    const res = await fetch(`${BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!res.ok) throw new Error('Tạo tài khoản thất bại.')

    success.value = 'Đăng ký thành công! Vui lòng đăng nhập.'
    setTimeout(() => router.replace('/login'), 800)
  } catch (e) {
    error.value = e.message || 'Có lỗi xảy ra.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped></style>
