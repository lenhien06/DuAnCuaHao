<template>
  <aside id="sidebar" class="d-flex flex-column p-3">
    <h2 class="text-center mb-1">GrabFood</h2>
    <h3 class="text-center mb-4">Admin</h3>

    <ul class="nav nav-pills flex-column">
      <li class="nav-item mb-2" v-for="item in items" :key="item.to">
        <RouterLink
          class="nav-link"
          :class="{ active: isActive(item.to) }"
          :to="item.to"
          :aria-current="isActive(item.to) ? 'page' : null"
        >
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>

    <!-- Khu vực đáy: hiển thị ai đang đăng nhập + nút Đăng xuất -->
    <div class="mt-auto pt-3">
      <div class="small opacity-75 mb-2">
        Đang đăng nhập: <strong>{{ user?.name || '—' }}</strong>
      </div>
      <button class="btn btn-outline-light w-100" @click="logout">
        Đăng xuất
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Menu: đổi 'to' nếu route của bạn khác
const items = [
  { label: 'Quản lý nhân viên', to: '/admin/users' },
  { label: 'Quản lý sản phẩm', to: '/admin/products' },
  { label: 'Doanh thu', to: '/admin/dashboard' }, // nếu dashboard là '/admin' thì sửa lại
  { label: 'Thông tin cửa hàng', to: '/admin/profile' },
]

// Active dựa trên path hiện tại
const isActive = (to) => route.path.startsWith(to)

// Lấy user từ localStorage + đồng bộ qua storage event
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const syncUser = () => {
  try { user.value = JSON.parse(localStorage.getItem('user') || 'null') }
  catch { user.value = null }
}
onMounted(() => window.addEventListener('storage', syncUser))
onUnmounted(() => window.removeEventListener('storage', syncUser))

// Đăng xuất
const logout = () => {
  localStorage.removeItem('user')
  user.value = null
  router.replace('/login') // hoặc: window.location.href = '/'
}
</script>

<style scoped>
#sidebar {
  width: 220px;
  background-color: #28a745; /* xanh GrabFood */
  color: #fff;
  height: 100vh;
}

#sidebar .nav-link {
  color: #fff;
  border-radius: 0;
}

#sidebar .nav-link.active {
  background-color: #218838;
}
</style>
