<template>
  <!-- Tiêu đề -->
  <div class="d-flex align-items-center mb-4 position-relative">
    <i class="bi bi-bar-chart-line-fill fs-2 me-2 text-success"></i>
    <h2 class="fw-bold text-success mb-0 position-relative">
      Doanh thu
      <span class="title-underline"></span>
    </h2>
  </div>

  <!-- Card Biểu đồ -->
  <div class="card p-3 mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">Biểu đồ doanh thu</h5>

      <div class="btn-group">
        <button
          v-for="f in frames"
          :key="f.key"
          class="btn btn-success btn-sm btn-timeframe"
          :class="{ active: currentFrame === f.key }"
          @click="setFrame(f.key)"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <div class="chart-wrap">
      <canvas ref="chartEl"></canvas>
    </div>

    <p class="mt-2 fw-bold">
      Tổng doanh thu:
      <span>{{ formatVND(totalRevenue) }}</span>
    </p>
  </div>

  <!-- Card bảng sản phẩm -->
  <div class="card p-3">
    <h5 class="mb-3">Sản phẩm đã bán</h5>

    <div v-if="loading" class="text-muted py-4 text-center">Đang tải dữ liệu…</div>
    <div v-else-if="error" class="text-danger py-4 text-center">{{ error }}</div>

    <table v-else class="table table-hover align-middle mb-0">
      <thead>
        <tr>
          <th>Tên sản phẩm</th>
          <th class="text-end">Số lượng đã bán</th>
          <th class="text-end">Giá bán (VNĐ)</th>
          <th class="text-end">Tổng doanh thu (VNĐ)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in soldProducts" :key="p.id">
          <td>{{ p.name }}</td>
          <td class="text-end">{{ p.qty }}</td>
          <td class="text-end">{{ formatVND(p.price) }}</td>
          <td class="text-end">{{ formatVND(p.qty * p.price) }}</td>
        </tr>
        <tr v-if="!soldProducts.length">
          <td colspan="4" class="text-center text-muted py-4">Chưa có dữ liệu</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import Chart from 'chart.js/auto'

/** ====== CONFIG ====== */
const API_BASE = 'http://localhost:3000'

/** ====== STATE ====== */
const loading = ref(true)
const error = ref('')

const frames = ref([]) // [{key,label}]
const currentFrame = ref('day')

const revenueData = ref({ day: [], week: [], month: [], year: [] })
const labels = ref({ day: [], week: [], month: [], year: [] })
const soldProducts = ref([]) // có thể rỗng nếu db.json không khai báo

/** ====== CHART ====== */
const chartEl = ref(null)
let chartInstance = null

const formatVND = (n) =>
  (n ?? 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

// Chuẩn hóa: độ dài labels phải khớp data
const currentSeries = computed(() => {
  const key = currentFrame.value
  const d = Array.isArray(revenueData.value[key]) ? revenueData.value[key] : []
  const l = Array.isArray(labels.value[key]) ? labels.value[key] : []
  const len = Math.min(d.length, l.length)
  return { d: d.slice(0, len), l: l.slice(0, len) }
})

const totalRevenue = computed(() => currentSeries.value.d.reduce((a, b) => a + (b || 0), 0))

function buildChart() {
  if (!chartEl.value) return
  // nếu đã tồn tại thì phá hủy trước khi tạo lại (tránh duplicate)
  chartInstance?.destroy()
  chartInstance = new Chart(chartEl.value.getContext('2d'), {
    type: 'line',
    data: {
      labels: currentSeries.value.l,
      datasets: [
        {
          label: 'Doanh thu',
          data: currentSeries.value.d,
          borderColor: '#28a745',
          backgroundColor: 'rgba(40,167,69,0.2)',
          tension: 0.4,
          fill: true,
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val) => Number(val).toLocaleString('vi-VN')
          }
        }
      }
    }
  })
}

function updateChart() {
  if (!chartInstance) return buildChart()
  chartInstance.data.labels = currentSeries.value.l
  chartInstance.data.datasets[0].data = currentSeries.value.d
  chartInstance.update()
}

function setFrame(key) {
  if (currentFrame.value === key) return
  currentFrame.value = key
  updateChart()
}

/** ====== API ====== */
async function fetchDashboard() {
  loading.value = true
  error.value = ''
  try {
    // ✅ Dùng axios thay vì api (vì api chưa được import)
    const { data } = await axios.get(`${API_BASE}/dashboard`)
    // data: { frames, revenueData, labels, (optional) soldProducts }
    frames.value = data.frames || []
    revenueData.value = data.revenueData || {}
    labels.value = data.labels || {}

    // Nếu db.json KHÔNG có soldProducts thì để rỗng
    const rawSold = Array.isArray(data.soldProducts) ? data.soldProducts : []
    soldProducts.value = rawSold.map((p, i) => ({
      id: p.id ?? i + 1,
      name: p.name ?? `SP #${i + 1}`,
      qty: Number(p.qty) || 0,
      price: Number(p.price) || 0
    }))

    // Frame mặc định
    currentFrame.value = frames.value[0]?.key || 'day'

    // Render chart
    buildChart()
  } catch (e) {
    console.error(e)
    error.value = 'Không tải được dữ liệu dashboard.'
  } finally {
    loading.value = false
  }
}

/** ====== LIFECYCLE ====== */
onMounted(fetchDashboard)
onBeforeUnmount(() => {
  chartInstance?.destroy()
  chartInstance = null
})
</script>

<style scoped>
body {
  background-color: #f2f5f7;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
h2 {
  color: #28a745;
  font-weight: 700;
}
.card {
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.btn-timeframe {
  border-radius: 20px;
  margin-right: 5px;
}
table thead {
  background-color: #28a745;
  color: white;
}
tbody tr:hover {
  background-color: #e6f2ea;
}
/* Đảm bảo canvas có chiều cao cố định để Chart.js responsive đẹp */
.chart-wrap {
  height: 320px;
}
</style>
