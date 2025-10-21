<template>
  <div class="container py-4">
    <!-- Tiêu đề -->
    <div class="d-flex align-items-center mb-4 position-relative">
      <i class="bi bi-box-seam fs-2 me-2 text-success"></i>
      <h2 class="fw-bold text-success mb-0 position-relative">
        Quản lý sản phẩm
        <span class="title-underline"></span>
      </h2>
    </div>

    <!-- Alert (transition) -->
    <Transition name="fade-alert">
      <div
        v-if="alert.show"
        class="alert alert-dismissible shadow-sm"
        :class="`alert-${alert.variant}`"
        role="alert"
      >
        {{ alert.message }}
        <button type="button" class="btn-close" @click="hideAlert"></button>
      </div>
    </Transition>

    <!-- Danh sách -->
    <div class="card mt-3 p-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Danh sách sản phẩm</h5>
        <button class="btn btn-success btn-sm" @click="openModal()">+ Thêm sản phẩm</button>
      </div>

      <div v-if="loading" class="py-4 text-center text-muted">
        <span class="spinner-border spinner-border-sm me-2"></span>Đang tải…
      </div>
      <div v-else-if="error" class="py-4 text-center text-danger">{{ error }}</div>

      <table v-else class="table table-hover align-middle">
        <thead>
          <tr>
            <th style="width:72px">Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Nhãn hiệu</th>
            <th>Tên cửa hàng</th>
            <th class="text-center">Trạng thái</th>
            <th class="text-end">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>
              <img
                v-if="p.image"
                :src="p.image"
                alt="thumb"
                class="rounded"
                style="width:48px;height:48px;object-fit:cover"
              />
              <div
                v-else
                class="bg-light rounded d-flex align-items-center justify-content-center"
                style="width:48px;height:48px"
              >—</div>
            </td>
            <td>{{ p.name }}</td>
            <td>{{ p.brand }}</td>
            <td>{{ p.store }}</td>
            <td class="text-center">
              <button
                class="btn btn-sm"
                :class="p.status === 'active' ? 'btn-status-active' : 'btn-status-inactive'"
                @click="toggleStatus(p)"
                :disabled="togglingId === p.id"
              >
                <span v-if="togglingId === p.id" class="spinner-border spinner-border-sm me-1"></span>
                {{ p.status === 'active' ? 'Hoạt động' : 'Ngừng' }}
              </button>
            </td>
            <td class="text-end">
              <button class="btn btn-primary btn-sm btn-edit me-1" @click="openModal(p)">
                <i class="bi bi-pencil-square me-1"></i>Sửa
              </button>
              <button class="btn btn-danger btn-sm btn-delete" @click="confirmDelete(p)">
                <i class="bi bi-trash me-1"></i>Xóa
              </button>
            </td>
          </tr>
          <tr v-if="!products.length">
            <td colspan="6" class="text-center text-muted py-4">Chưa có sản phẩm</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Thêm/Sửa -->
    <div class="modal fade" ref="modalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <form class="modal-content" @submit.prevent="saveProduct">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Sửa sản phẩm' : 'Thêm sản phẩm' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
          </div>

          <div class="modal-body">
            <!-- Ảnh (Cloudinary) -->
            <div class="mb-3">
              <label class="form-label">Ảnh sản phẩm</label>
              <div class="d-flex align-items-center gap-3">
                <img
                  v-if="imagePreview || form.image"
                  :src="imagePreview || form.image"
                  alt="preview"
                  class="rounded border"
                  style="width:80px;height:80px;object-fit:cover"
                />
                <div
                  v-else
                  class="bg-light rounded d-flex align-items-center justify-content-center"
                  style="width:80px;height:80px"
                >No image</div>

                <div class="d-flex align-items-center gap-2">
                  <input ref="fileInput" type="file" accept="image/*" @change="uploadImage" />
                  <button
                    v-if="form.image || imagePreview"
                    class="btn btn-outline-secondary btn-sm"
                    type="button"
                    @click="clearImage"
                  >
                    <i class="bi bi-x-circle me-1"></i>Xóa ảnh
                  </button>
                </div>
              </div>

              <!-- Progress -->
              <div v-if="uploading" class="progress mt-2" style="height:8px">
                <div class="progress-bar" role="progressbar" :style="{ width: uploadProgress + '%' }">
                  <span class="visually-hidden">{{ uploadProgress }}%</span>
                </div>
              </div>
              <div v-if="uploadError" class="text-danger small mt-1">{{ uploadError }}</div>
              <div v-if="uploading" class="text-muted small mt-1">Đang tải ảnh lên Cloudinary…</div>
            </div>

            <!-- Tên -->
            <div class="mb-3">
              <label class="form-label">Tên sản phẩm</label>
              <input
                type="text"
                class="form-control"
                v-model.trim="form.name"
                :class="invalidClass('name')"
                required
              />
              <div v-if="submitted && !form.name" class="invalid-feedback d-block">
                Vui lòng nhập tên sản phẩm.
              </div>
            </div>

            <!-- Giá -->
            <div class="mb-3">
              <label class="form-label">Giá (VNĐ)</label>
              <input type="number" min="0" class="form-control" v-model.number="form.price" />
            </div>

            <!-- Nguồn gốc -->
            <div class="mb-3">
              <label class="form-label">Nguồn gốc</label>
              <input type="text" class="form-control" v-model.trim="form.origin" />
            </div>

            <!-- Nhãn hiệu -->
            <div class="mb-3">
              <label class="form-label">Nhãn hiệu</label>
              <input
                type="text"
                class="form-control"
                v-model.trim="form.brand"
                :class="invalidClass('brand')"
                required
              />
              <div v-if="submitted && !form.brand" class="invalid-feedback d-block">
                Vui lòng nhập nhãn hiệu.
              </div>
            </div>

            <!-- Cửa hàng -->
            <div class="mb-3">
              <label class="form-label">Tên cửa hàng</label>
              <input
                type="text"
                class="form-control"
                v-model.trim="form.store"
                :class="invalidClass('store')"
                required
              />
              <div v-if="submitted && !form.store" class="invalid-feedback d-block">
                Vui lòng nhập tên cửa hàng.
              </div>
            </div>

            <!-- Trạng thái -->
            <div class="mb-3">
              <label class="form-label">Trạng thái</label>
              <select class="form-select" v-model="form.status">
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng</option>
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Hủy</button>
            <button class="btn btn-success" type="submit" :disabled="saving || uploading">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import Modal from 'bootstrap/js/dist/modal'   // ✅ ESM

/* ====== Config ====== */
const API_BASE = 'http://localhost:3000'   // json-server
const CLOUD_NAME = 'dyuutuwvb'             // Cloudinary của bạn
const UPLOAD_PRESET = 'ASM2-Vue-API'       // unsigned preset
const CLOUD_FOLDER = ''                    // ví dụ: 'grabfood/products'

/* ====== State ====== */
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const products = ref([])

const alert = reactive({ show: false, message: '', variant: 'success', timer: null })

const isEdit = ref(false)
const submitted = ref(false)
const form = reactive({
  id: null,
  name: '',
  price: 0,
  origin: '',
  brand: '',
  store: '',
  status: 'active',
  image: ''
})

/* Upload state */
const fileInput = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref('')
const imagePreview = ref('')   // ✅ preview tức thì

/* ====== Modal (Bootstrap 5 ESM) ====== */
const modalRef = ref(null)
function getModal() {
  if (!modalRef.value) return null
  return Modal.getOrCreateInstance(modalRef.value, { backdrop: 'static', keyboard: false })
}
function openModal(product = null) {
  isEdit.value = !!product
  submitted.value = false
  uploadError.value = ''
  uploadProgress.value = 0
  uploading.value = false

  if (product) {
    Object.assign(form, product)
    imagePreview.value = form.image || ''   // ✅ đồng bộ preview khi sửa
  } else {
    resetForm()
  }

  getModal()?.show()
}
function closeModal() { getModal()?.hide() }
onBeforeUnmount(() => {
  const inst = Modal.getInstance(modalRef.value)
  inst?.dispose()
})
function resetForm() {
  Object.assign(form, {
    id: null,
    name: '',
    price: 0,
    origin: '',
    brand: '',
    store: '',
    status: 'active',
    image: ''
  })
  imagePreview.value = '' // ✅ clear preview
}

/* ====== Helpers ====== */
function showAlert(message, variant = 'success', timeout = 2500) {
  alert.message = message
  alert.variant = variant
  alert.show = true
  if (alert.timer) clearTimeout(alert.timer)
  alert.timer = setTimeout(() => (alert.show = false), timeout)
}
function hideAlert() {
  if (alert.timer) { clearTimeout(alert.timer); alert.timer = null }
  alert.show = false
}
function invalidClass(field) {
  return submitted.value && !form[field] ? 'is-invalid' : ''
}
function validate() {
  return !!(form.name && form.brand && form.store)
}

/* ====== CRUD ====== */
async function fetchProduct() {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get(`${API_BASE}/products`)
    products.value = res.data
  } catch (err) {
    console.error(err)
    error.value = 'Không tải được danh sách sản phẩm.'
  } finally {
    loading.value = false
  }
}

async function saveProduct() {
  submitted.value = true
  if (!validate()) return
  if (uploading.value) {
    showAlert('Đang tải ảnh lên — chờ xong rồi lưu.', 'warning', 3000)
    return
  }

  saving.value = true
  try {
    const payload = {
      name: form.name,
      price: form.price,
      origin: form.origin,
      brand: form.brand,
      store: form.store,
      status: form.status,
      image: form.image
    }

    if (isEdit.value && form.id != null) {
      await axios.put(`${API_BASE}/products/${form.id}`, payload)
      const idx = products.value.findIndex(p => p.id === form.id)
      if (idx !== -1) products.value.splice(idx, 1, { id: form.id, ...payload }) // ✅ đảm bảo reactivity
      showAlert('Cập nhật sản phẩm thành công.', 'success')
    } else {
      const { data } = await axios.post(`${API_BASE}/products`, payload)
      products.value.push(data)
      showAlert('Thêm sản phẩm thành công.', 'success')
    }
    closeModal()
  } catch (err) {
    console.error(err)
    showAlert('Lưu thất bại. Vui lòng thử lại.', 'danger')
  } finally {
    saving.value = false
  }
}

async function confirmDelete(p) {
  if (!window.confirm(`Xóa sản phẩm "${p.name}"?`)) return
  try {
    await axios.delete(`${API_BASE}/products/${p.id}`)
    products.value = products.value.filter(x => x.id !== p.id)
    showAlert('Xóa sản phẩm thành công.', 'success')
  } catch (err) {
    console.error(err)
    showAlert('Xóa thất bại. Vui lòng thử lại.', 'danger')
  }
}

const togglingId = ref(null)
async function toggleStatus(p) {
  try {
    togglingId.value = p.id
    const next = p.status === 'active' ? 'inactive' : 'active'
    await axios.patch(`${API_BASE}/products/${p.id}`, { status: next })
    p.status = next
    showAlert('Cập nhật trạng thái thành công.', 'success')
  } catch (err) {
    console.error(err)
    showAlert('Cập nhật trạng thái thất bại.', 'danger')
  } finally {
    togglingId.value = null
  }
}

/* ====== Cloudinary upload (unsigned) ====== */
function clearImage() {
  imagePreview.value = ''
  form.image = ''
  if (fileInput.value) fileInput.value.value = ''
}
async function uploadImage(e) {
  const file = e.target.files?.[0]
  if (!file) return

  // Preview tạm thời
  imagePreview.value = URL.createObjectURL(file)

  uploading.value = true
  uploadError.value = ''
  uploadProgress.value = 0

  try {
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    if (CLOUD_FOLDER) fd.append('folder', CLOUD_FOLDER)

    const res = await axios.post(url, fd, {
      onUploadProgress: (evt) => {
        if (!evt.total) return
        uploadProgress.value = Math.round((evt.loaded / evt.total) * 100)
      }
    })

    // Fallback secure_url/url
    const uploadedUrl = res?.data?.secure_url || res?.data?.url
    if (!uploadedUrl) throw new Error('Cloudinary không trả về URL ảnh')

    form.image = uploadedUrl
    imagePreview.value = uploadedUrl
    showAlert('Tải ảnh lên thành công.', 'success')
  } catch (err) {
    console.error(err)
    const msg = err?.response?.data?.error?.message || 'Không thể tải ảnh lên Cloudinary.'
    uploadError.value = msg
    showAlert(`Upload ảnh thất bại: ${msg}`, 'danger')
    imagePreview.value = ''
    form.image = ''
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

/* ====== INIT ====== */
onMounted(fetchProduct)
</script>

<!-- Global (KHÔNG scoped) cho body/h2 -->
<style>
body {
  background-color: #f2f5f7;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
h2 {
  color: #28a745;
  font-weight: 700;
}
</style>

<!-- Scoped cho component -->
<style scoped>
.card {
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.table thead {
  background-color: #28a745;
  color: white;
  border-radius: 10px 10px 0 0;
}
tbody tr:hover { background-color: #e6f2ea; }
.btn-status-active { background-color: #28a745; color: white; border-radius: 20px; }
.btn-status-inactive { background-color: #dc3545; color: white; border-radius: 20px; }
.btn-edit, .btn-delete { border-radius: 20px; }
.title-underline {
  position: absolute; bottom: -5px; left: 0; width: 80px; height: 4px;
  background: linear-gradient(to right, #28a745, #85e085); border-radius: 2px;
}

/* Alert transition */
.fade-alert-enter-active,
.fade-alert-leave-active { transition: all .25s ease; }
.fade-alert-enter-from,
.fade-alert-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
