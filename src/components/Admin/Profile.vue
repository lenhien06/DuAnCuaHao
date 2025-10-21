<template>
  <div class="container py-4">
    <!-- Tiêu đề -->
    <div class="d-flex align-items-center mb-4 position-relative">
      <i class="bi bi-shop fs-2 me-2 text-success"></i>
      <h2 class="fw-bold text-success mb-0 position-relative">
        Thông tin cửa hàng
        <span class="title-underline"></span>
      </h2>
    </div>

    <!-- Alert -->
    <div v-if="alert.show" class="alert" :class="`alert-${alert.variant}`" role="alert">
      {{ alert.message }}
    </div>

    <div class="row g-4">
      <!-- Logo / Hình ảnh -->
      <div class="col-md-4">
        <div class="card p-3 text-center">
          <img :src="store.logo || placeholderLogo" alt="Logo cửa hàng" class="store-logo" />
          <h5 class="mt-3">{{ store.name || '—' }}</h5>
          <button class="btn btn-success btn-sm btn-edit mt-2" @click="openModal()">Sửa thông tin</button>
        </div>
      </div>

      <!-- Thông tin cơ bản -->
      <div class="col-md-8">
        <div class="card p-3">
          <h5 class="mb-3">Thông tin cơ bản</h5>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <strong>Địa chỉ:</strong> <span>{{ store.address || '—' }}</span>
            </li>
            <li class="list-group-item">
              <strong>Điện thoại:</strong> <span>{{ store.phone || '—' }}</span>
            </li>
            <li class="list-group-item">
              <strong>Email:</strong> <span>{{ store.email || '—' }}</span>
            </li>
            <li class="list-group-item">
              <strong>Website / Fanpage:</strong> <span>{{ store.website || '—' }}</span>
            </li>
            <li class="list-group-item">
              <strong>Chủ cửa hàng:</strong> <span>{{ store.owner || '—' }}</span>
            </li>
            <li class="list-group-item">
              <strong>Nhân viên hiện có:</strong> <span>{{ store.staffCount ?? '—' }}</span>
            </li>
            <li class="list-group-item">
              <strong>Giờ mở cửa:</strong>
              <span>{{ store.open || '—' }}</span> - <span>{{ store.close || '—' }}</span>
            </li>
            <li class="list-group-item">
              <strong>Ngày thành lập:</strong>
              <span>{{ displayDate(store.established) || '—' }}</span>
            </li>
            <li class="list-group-item">
              <strong>Tình trạng hoạt động:</strong> <span>{{ store.status || '—' }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Modal chỉnh sửa -->
    <div class="modal fade" ref="modalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <form class="modal-content" @submit.prevent="save">
          <div class="modal-header">
            <h5 class="modal-title">Chỉnh sửa thông tin cửa hàng</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
          </div>

          <div class="modal-body">
            <div class="row g-3">
              <!-- Tên + Logo -->
              <div class="col-md-6">
                <label class="form-label">Tên cửa hàng</label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="form.name"
                  :class="invalidClass('name')"
                  required
                />
                <div v-if="submitted && !form.name" class="invalid-feedback d-block">
                  Vui lòng nhập tên cửa hàng.
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Logo cửa hàng</label>
                <input type="file" class="form-control" accept="image/*" @change="onLogoChange" />
                <img
                  v-if="logoPreview"
                  :src="logoPreview"
                  alt="Preview logo"
                  class="mt-2 rounded"
                  style="max-width:100px;"
                />
              </div>

              <!-- Địa chỉ + Điện thoại -->
              <div class="col-md-6">
                <label class="form-label">Địa chỉ</label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="form.address"
                  :class="invalidClass('address')"
                  required
                />
                <div v-if="submitted && !form.address" class="invalid-feedback d-block">
                  Vui lòng nhập địa chỉ.
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">Điện thoại</label>
                <input
                  type="text"
                  class="form-control"
                  v-model.trim="form.phone"
                  :class="invalidClass('phone')"
                  required
                />
                <div v-if="submitted && !form.phone" class="invalid-feedback d-block">
                  Vui lòng nhập số điện thoại.
                </div>
              </div>

              <!-- Email + Website -->
              <div class="col-md-6">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" v-model.trim="form.email" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Website / Fanpage</label>
                <input type="text" class="form-control" v-model.trim="form.website" />
              </div>

              <!-- Chủ + Số NV -->
              <div class="col-md-6">
                <label class="form-label">Chủ cửa hàng</label>
                <input type="text" class="form-control" v-model.trim="form.owner" />
              </div>
              <div class="col-md-3">
                <label class="form-label">Số nhân viên</label>
                <input type="number" class="form-control" v-model.number="form.staffCount" min="0" />
              </div>

              <!-- Ngày lập + Giờ mở/đóng -->
              <div class="col-md-3">
                <label class="form-label">Ngày thành lập</label>
                <input type="date" class="form-control" v-model="form.established" />
              </div>
              <div class="col-md-3">
                <label class="form-label">Giờ mở cửa</label>
                <input
                  type="time"
                  class="form-control"
                  v-model="form.open"
                  :class="invalidClass('open')"
                  required
                />
                <div v-if="submitted && !form.open" class="invalid-feedback d-block">
                  Vui lòng chọn giờ mở cửa.
                </div>
              </div>
              <div class="col-md-3">
                <label class="form-label">Giờ đóng cửa</label>
                <input
                  type="time"
                  class="form-control"
                  v-model="form.close"
                  :class="invalidClass('close')"
                  required
                />
                <div v-if="submitted && !form.close" class="invalid-feedback d-block">
                  Vui lòng chọn giờ đóng cửa.
                </div>
              </div>

              <!-- Trạng thái -->
              <div class="col-md-6">
                <label class="form-label">Tình trạng hoạt động</label>
                <select class="form-select" v-model="form.status">
                  <option value="Mở cửa">Mở cửa</option>
                  <option value="Đóng cửa tạm thời">Đóng cửa tạm thời</option>
                </select>
              </div>
            </div>

            <div v-if="loading" class="text-muted mt-3">
              <span class="spinner-border spinner-border-sm me-1"></span>Đang lưu…
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" data-bs-dismiss="modal">Hủy</button>
            <button class="btn btn-success w-100" type="submit" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Lưu thay đổi
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
import Modal from 'bootstrap/js/dist/modal'

const API_BASE = 'http://localhost:3000'
const STORE_RESOURCE = 'stores'
const STORE_ID = 1

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const alert = reactive({ show: false, message: '', variant: 'success', timer: null })

const placeholderLogo = '/placeholder-logo.png' // ✅ dùng file local

const store = reactive({
  id: STORE_ID, logo: '', name: '', address: '', phone: '', email: '',
  website: '', owner: '', staffCount: 0, open: '', close: '', established: '',
  status: 'Mở cửa'
})

/* ===== Modal (ESM) ===== */
const modalRef = ref(null)
function getModal() {
  if (!modalRef.value) return null
  return Modal.getOrCreateInstance(modalRef.value, { backdrop: 'static', keyboard: false })
}
function openModal() {
  submitted.value = false
  logoPreview.value = store.logo || ''
  Object.assign(form, store)
  getModal()?.show()
}
function closeModal() { getModal()?.hide() }
onBeforeUnmount(() => { Modal.getInstance(modalRef.value)?.dispose() })

/* ===== Form/Validate ===== */
const form = reactive({ ...store })
const submitted = ref(false)
function invalidClass(field) { return submitted.value && !form[field] ? 'is-invalid' : '' }
function validate() { return !!(form.name && form.address && form.phone && form.open && form.close) }

/* ===== Logo preview ===== */
const logoPreview = ref('')
function onLogoChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = ev => { logoPreview.value = ev.target?.result || '' }
  reader.readAsDataURL(file)
}

/* ===== Helpers ===== */
function showAlert(message, variant = 'success', timeout = 2500) {
  alert.message = message; alert.variant = variant; alert.show = true
  if (alert.timer) clearTimeout(alert.timer)
  alert.timer = setTimeout(() => (alert.show = false), timeout)
}
function displayDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d) ? iso : d.toLocaleDateString('vi-VN')
}

/* ===== API ===== */
async function fetchStore() {
  loading.value = true; error.value = ''
  try {
    const res = await axios.get(`${API_BASE}/${STORE_RESOURCE}/${STORE_ID}`)
    Object.assign(store, res.data)
  } catch (e) {
    if (e?.response?.status === 404) {
      const { data } = await axios.post(`${API_BASE}/${STORE_RESOURCE}`, { ...store })
      Object.assign(store, data)
    } else {
      console.error(e); error.value = 'Không tải được thông tin cửa hàng.'
    }
  } finally { loading.value = false }
}

async function save() {
  submitted.value = true
  if (!validate()) return
  saving.value = true
  try {
    const payload = { ...form, logo: logoPreview.value || store.logo || '' }
    await axios.put(`${API_BASE}/${STORE_RESOURCE}/${STORE_ID}`, payload)
    Object.assign(store, payload)
    showAlert('Cập nhật thông tin cửa hàng thành công.', 'success')
    closeModal()
  } catch (e) {
    console.error(e)
    showAlert('Lưu thất bại. Vui lòng thử lại.', 'danger')
  } finally { saving.value = false }
}

onMounted(fetchStore)
</script>


<!-- Global (không scoped) cho body/h2) -->
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
.card img.store-logo {
  max-width: 150px;
  border-radius: 10px;
}
.btn-edit {
  border-radius: 20px;
}
.list-group-item {
  border: none;
  padding-left: 0;
  padding-right: 0;
}
.title-underline {
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 80px;
  height: 4px;
  background: linear-gradient(to right, #28a745, #85e085);
  border-radius: 2px;
}
</style>
