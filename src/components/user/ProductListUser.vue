<template>
  <main class="container py-5">
    <h3 class="fw-bold text-center mb-4">{{ heading }}</h3>

    <div v-if="loading" class="text-center text-muted">Đang tải sản phẩm...</div>
    <div v-else-if="error" class="alert alert-danger text-center">{{ error }}</div>
    <div v-else-if="products.length === 0" class="text-center text-muted">Không có sản phẩm nào.</div>

    <div v-else class="row g-4">
      <div class="col-12 col-md-4 col-lg-3" v-for="p in products" :key="p.id">
        <div class="card product-card border-0 shadow-sm h-100">
          <img :src="safeSrc(p.image)" :alt="p.name" class="product-img card-img-top" loading="lazy"
            @error="onImgError" />
          <div class="card-body text-center d-flex flex-column">
            <h6 class="fw-bold">{{ p.name }}</h6>
            <p class="text-success fw-semibold mb-2">{{ formatCurrency(p.price) }}</p>
            <div class="text-muted small">{{ p.brand || p.store || '—' }}</div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const API_BASE = 'http://localhost:3000'
const route = useRoute()

const products = ref([])
const loading = ref(true)
const error = ref('')

const categoryMap = ref({})
const categoryKey = computed(() => route.query.category || '')
const categoryLabel = computed(() => categoryMap.value[categoryKey.value] || '')

const heading = computed(() =>
  categoryLabel.value ? `Sản phẩm · ${categoryLabel.value}` : 'Tất cả sản phẩm'
)

function formatCurrency(amount) {
  return (amount ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

/** Encode từng segment cho đường dẫn trong /img/... (xử lý dấu + khoảng trắng) */
function encodeImgPath(url) {
  // Ví dụ: /img/cơm gà.jpg -> /img/c%C6%A1m%20g%C3%A0.jpg
  return url.replace(/^\/img\/(.+)$/, (_, rest) => {
    return '/img/' + rest.split('/').map(encodeURIComponent).join('/')
  })
}

function safeSrc(u) {
  const url = u || ''
  if (url.startsWith('/img/')) return encodeImgPath(url)
  return url
}

/** Chặn vòng lặp fallback nếu fallback cũng lỗi */
function onImgError(e) {
  const img = e.target
  if (img.dataset.fallbackApplied === '1') return
  img.onerror = null
  img.dataset.fallbackApplied = '1'
  img.src = '/img/placeholder-product.jpg'
}

async function fetchCategoryMap() {
  try {
    const { data } = await axios.get(`${API_BASE}/categoryMap`)
    categoryMap.value = data || {}
  } catch {
    categoryMap.value = {}
  }
}

async function fetchProducts() {
  loading.value = true
  error.value = ''
  try {
    const label = categoryLabel.value
    const url = label
      ? `${API_BASE}/products?category=${encodeURIComponent(label)}`
      : `${API_BASE}/products`
    const { data } = await axios.get(url)

    products.value = (Array.isArray(data) ? data : []).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      brand: p.brand,
      store: p.store,
      category: p.category, // DB đang lưu label tiếng Việt
      image: p.image || p.img || '/img/placeholder-product.jpg'
    }))
  } catch (e) {
    console.error(e)
    error.value = 'Không thể tải danh sách sản phẩm.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchCategoryMap()
  await fetchProducts()
})

watch(() => route.query.category, fetchProducts)
</script>

<style scoped>
.product-card {
  transition: transform .2s, box-shadow .2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, .15);
}

.product-img {
  height: 180px;
  object-fit: cover;
  border-radius: .5rem .5rem 0 0;
}
</style>
