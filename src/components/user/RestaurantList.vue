<template>
  <div class="container my-5">
    <!-- ========== CHI TIẾT NHÀ HÀNG (có :id) ========== -->
    <template v-if="slug && !loading && restaurant">
      <div class="row align-items-center mb-4">
        <div class="col-md-3">
          <img
            :src="encodeLocalImg(restaurant.img)"
            :alt="restaurant.name"
            class="img-fluid rounded"
            @error="onImgError"
          />
        </div>
        <div class="col-md-9">
          <h2>{{ restaurant.name }}</h2>
          <p class="text-muted">{{ restaurant.desc }}</p>
          <span class="badge bg-success">{{ restaurant.rating }}</span>
        </div>
      </div>

      <h4 class="fw-bold mb-3">Menu</h4>
      <div class="row g-4">
        <div v-for="item in restaurant.menu" :key="item.id" class="col-6 col-md-3">
          <div class="card h-100 shadow-sm">
            <img
              :src="encodeLocalImg(item.img)"
              :alt="item.name"
              class="card-img-top menu-img"
              @error="onImgError"
            />
            <div class="card-body d-flex flex-column">
              <h6 class="fw-bold">{{ item.name }}</h6>
              <p class="text-muted small mb-2">{{ formatCurrency(item.price) }}</p>

              <div class="d-flex justify-content-center align-items-center mt-auto">
                <button class="btn btn-sm btn-outline-secondary" @click="decreaseQty(item)">-</button>
                <input
                  class="form-control form-control-sm mx-2 text-center"
                  style="width:50px"
                  v-model="item.quantity"
                  readonly
                />
                <button class="btn btn-sm btn-outline-secondary" @click="increaseQty(item)">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== LƯỚI NHÀ HÀNG NỔI BẬT (không có :id) ========== -->
    <template v-else>
      <h3 class="fw-bold mb-3">Nhà hàng nổi bật</h3>

      <div v-if="loading" class="text-center text-muted">Đang tải…</div>
      <div v-else-if="error" class="alert alert-danger text-center">{{ error }}</div>

      <div v-else class="row g-4">
        <div v-for="r in featured" :key="r.id" class="col-6 col-md-4 col-lg-3">
          <div class="card h-100 shadow-sm hover-card" @click="goDetail(r.id)" role="button">
            <img
              :src="encodeLocalImg(r.img)"
              :alt="r.name"
              class="card-img-top grid-img"
              loading="lazy"
              @error="onImgError"
            />
            <div class="card-body">
              <h6 class="fw-bold mb-1 text-dark">{{ r.name }}</h6>
              <div class="text-muted small d-flex align-items-center gap-2">
                <span class="badge bg-success">{{ r.rating }}</span>
                <span class="text-truncate-2">{{ r.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ========== TRẠNG THÁI LỖI / KHÔNG TỒN TẠI ========== -->
    <div v-if="!loading && slug && !restaurant" class="mt-5 text-center text-danger">
      Nhà hàng không tồn tại!
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

const API_BASE = 'http://localhost:3000'
const FALLBACK_IMG = '/img/placeholder-restaurant.jpg'
const FALLBACK_MENU_IMG = '/img/placeholder-product.jpg'

const route = useRoute()
const router = useRouter()

/** Khi có :id thì hiển thị chi tiết; không có thì hiển thị lưới nổi bật */
const slug = computed(() => {
  const id = route.params.id
  if (id == null) return ''
  // id có thể đã được encode trên URL
  return decodeURIComponent(String(id))
})

const loading = ref(false)
const error = ref('')
const restaurants = ref([])
const restaurant = ref(null)

/** ===== Helpers ===== */
function formatCurrency(n) {
  return (n ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}
function encodeLocalImg(u) {
  if (!u) return slug.value ? FALLBACK_MENU_IMG : FALLBACK_IMG
  if (u.startsWith('/img/')) {
    const rest = u.slice('/img/'.length)
    return '/img/' + rest.split('/').map(encodeURIComponent).join('/')
  }
  return u
}
function onImgError(e) {
  const img = e.target
  if (img.dataset.fallbackApplied === '1') return
  img.onerror = null
  img.dataset.fallbackApplied = '1'
  img.src = slug.value ? FALLBACK_MENU_IMG : FALLBACK_IMG
}

/** Lưới nổi bật: ưu tiên featured=true; nếu không có thì top theo rating */
function score(r) {
  const m = String(r.rating ?? '').match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 0
}
const featured = computed(() => {
  const withFlag = restaurants.value.filter(r => r.featured === true)
  const src = withFlag.length ? withFlag : restaurants.value
  return [...src].sort((a, b) => score(b) - score(a)).slice(0, 8)
})

/** Điều hướng chi tiết */
function goDetail(id) {
  router.push({ name: 'restaurant', params: { id } })
}

/** Tăng/giảm số lượng trong menu chi tiết (client-only) */
function increaseQty(item) { item.quantity++ }
function decreaseQty(item) { if (item.quantity > 1) item.quantity-- }

/** ===== API ===== */
async function fetchAllRestaurants() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.get(`${API_BASE}/restaurants`)
    restaurants.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error(e)
    error.value = 'Không tải được danh sách nhà hàng.'
  } finally {
    loading.value = false
  }
}

function normalizeRestaurant(r) {
  return {
    ...r,
    menu: Array.isArray(r.menu) ? r.menu.map(m => ({ ...m, quantity: 1 })) : []
  }
}

async function fetchRestaurantBySlug(id) {
  if (!id) return null
  // thử /restaurants/:id (json-server có thể trả 404 nếu id là string)
  const one = await axios.get(`${API_BASE}/restaurants/${encodeURIComponent(id)}`, {
    validateStatus: () => true
  })
  if (one.status === 200 && one.data && Object.keys(one.data).length) {
    return normalizeRestaurant(one.data)
  }
  // fallback ?id=
  const list = await axios.get(`${API_BASE}/restaurants`, { params: { id } })
  const found = Array.isArray(list.data) ? list.data[0] : null
  return found ? normalizeRestaurant(found) : null
}

async function load() {
  loading.value = true
  error.value = ''
  restaurant.value = null
  try {
    if (slug.value) {
      const r = await fetchRestaurantBySlug(slug.value)
      restaurant.value = r
      if (!r) error.value = 'Không tìm thấy nhà hàng.'
      else if (typeof document !== 'undefined') {
        document.title = `${r.name} - GrabFood`
      }
    } else {
      await fetchAllRestaurants()
      if (typeof document !== 'undefined') {
        document.title = 'Nhà hàng - GrabFood'
      }
    }
  } catch (e) {
    console.error(e)
    error.value = 'Có lỗi xảy ra. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}

/** load khi vào trang & khi đổi :id */
watch(() => route.params.id, load, { immediate: true })
</script>

<style scoped>
.grid-img { height: 150px; object-fit: cover; }
.menu-img { height: 150px; object-fit: cover; }
.hover-card { transition: transform .2s, box-shadow .2s; }
.hover-card:hover { transform: translateY(-5px); box-shadow: 0 6px 12px rgba(0,0,0,.15); }
.text-truncate-2 {
  display: -webkit-box;-webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
