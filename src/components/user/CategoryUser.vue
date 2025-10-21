<template>
  <section class="container py-5">
    <h3 class="fw-bold text-center mb-5">Chọn danh mục món ăn</h3>

    <div v-if="loading" class="text-center text-muted">Đang tải danh mục...</div>
    <div v-else-if="error" class="alert alert-danger text-center">{{ error }}</div>

    <div v-else class="row g-4 justify-content-center">
      <div class="col-6 col-md-3" v-for="cat in categories" :key="cat.key">
        <div class="card category-card border-0 text-center" @click="goToCategory(cat.key)">
          <img
            :src="cat.image"
            :alt="cat.name"
            class="category-img card-img-top"
            loading="lazy"
            @error="onImgError"
          />
          <div class="card-body">
            <h5 class="fw-bold mb-0">{{ cat.name }}</h5>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

/** ===== Config ===== */
const API_BASE = 'http://localhost:3000'
const IMG_BASE = '/img/categories'              // đặt ảnh: public/img/categories/<key>.jpg
const FALLBACK = '/img/placeholder-category.jpg'// đặt ảnh fallback: public/img/placeholder-category.jpg

/** ===== State ===== */
const router = useRouter()
const categories = ref([])  // [{ key, name, image }]
const loading = ref(true)
const error = ref('')

/** ===== Fetch ===== */
async function fetchCategories () {
  loading.value = true
  error.value = ''
  try {
    const { data: map } = await axios.get(`${API_BASE}/categoryMap`)
    if (!map || typeof map !== 'object') throw new Error('categoryMap không hợp lệ')

    // map object -> array + dựng đường dẫn ảnh
    categories.value = Object.entries(map).map(([key, name]) => ({
      key,
      name,
      // nếu bạn lỡ đặt tên ảnh có khoảng trắng/ký tự lạ, encodeURI sẽ an toàn hơn
      image: encodeURI(`${IMG_BASE}/${key}.jpg`),
    }))
  } catch (e) {
    console.error(e)
    error.value = 'Không thể tải danh mục từ db.json'
  } finally {
    loading.value = false
  }
}

/** ===== Handlers ===== */
// Chặn vòng lặp @error: nếu fallback cũng lỗi, dừng lại
function onImgError (ev) {
  const img = ev.target
  if (img.dataset.fallbackApplied === '1') return
  img.onerror = null              // gỡ handler để tránh loop nếu fallback 404
  img.dataset.fallbackApplied = '1'
  img.src = FALLBACK
}

function goToCategory (key) {
  router.push({ name: 'products', query: { category: key } })
}

/** ===== Init ===== */
onMounted(fetchCategories)
</script>

<style scoped>
.category-card {
  transition: all .25s ease;
  cursor: pointer;
  user-select: none;
}
.category-card:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 18px rgba(0, 0, 0, .18);
}
.category-img {
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
  width: 100%;
}
</style>
