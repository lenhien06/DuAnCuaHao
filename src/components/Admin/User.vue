<template>
  <div class="container py-4">
    <!-- Tiêu đề -->
    <div class="d-flex align-items-center mb-4 position-relative">
      <i class="bi bi-people-fill fs-2 me-2 text-success"></i>
      <h2 class="fw-bold text-success mb-0 position-relative">
        Quản lý nhân viên
        <span class="title-underline"></span>
      </h2>
    </div>

    <!-- Alert -->
    <div v-if="alert.show" class="alert" :class="`alert-${alert.variant}`" role="alert">
      {{ alert.message }}
    </div>

    <!-- Danh sách -->
    <div class="card mt-3 p-3">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="mb-0">Danh sách nhân viên</h5>
        <button class="btn btn-success btn-sm" @click="openModal()">+ Thêm nhân viên</button>
      </div>

      <div v-if="loading" class="py-4 text-center text-muted">
        <span class="spinner-border spinner-border-sm me-2"></span>Đang tải…
      </div>
      <div v-else-if="error" class="py-4 text-center text-danger">{{ error }}</div>

      <table v-else class="table table-hover align-middle">
        <thead>
          <tr>
            <th style="width:80px">ID</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th class="text-center">Trạng thái</th>
            <th class="text-end">Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in employees" :key="u.id">
            <td>{{ u.id }}</td>
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.phone }}</td>
            <td class="text-center">
              <button
                class="btn btn-sm"
                :class="u.status === 'active' ? 'status-active' : 'status-inactive'"
                @click="toggleStatus(u)"
                :disabled="togglingId === u.id"
              >
                <span v-if="togglingId === u.id" class="spinner-border spinner-border-sm me-1"></span>
                {{ u.status === 'active' ? 'Hoạt động' : 'Ngừng' }}
              </button>
            </td>
            <td class="text-end">
              <button class="btn btn-primary btn-sm btn-edit me-1" @click="openModal(u)">
                <i class="bi bi-pencil-square me-1"></i>Sửa
              </button>
              <button class="btn btn-danger btn-sm btn-delete" @click="confirmDelete(u)">
                <i class="bi bi-trash me-1"></i>Xóa
              </button>
            </td>
          </tr>
          <tr v-if="!employees.length">
            <td colspan="6" class="text-center text-muted py-4">Chưa có nhân viên</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Thêm/Sửa -->
    <div class="modal fade" ref="modalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <form class="modal-content" @submit.prevent="save">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEdit ? 'Sửa nhân viên' : 'Thêm nhân viên' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Đóng"></button>
          </div>

          <div class="modal-body">
            <!-- Họ tên -->
            <div class="mb-3">
              <label class="form-label">Họ tên</label>
              <input
                type="text"
                class="form-control"
                v-model.trim="form.name"
                :class="invalidClass('name')"
                required
              />
              <div v-if="submitted && !form.name" class="invalid-feedback d-block">
                Vui lòng nhập họ tên.
              </div>
            </div>

            <!-- Email -->
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input
                type="email"
                class="form-control"
                v-model.trim="form.email"
                :class="invalidEmailClass"
                required
              />
              <div v-if="submitted && !isValidEmail(form.email)" class="invalid-feedback d-block">
                Email không hợp lệ.
              </div>
            </div>

            <!-- Số điện thoại -->
            <div class="mb-3">
              <label class="form-label">Số điện thoại</label>
              <input
                type="text"
                class="form-control"
                v-model.trim="form.phone"
                :class="invalidPhoneClass"
                required
                placeholder="Ví dụ: 0912345678"
              />
              <div v-if="submitted && !isValidPhone(form.phone)" class="invalid-feedback d-block">
                Số điện thoại không hợp lệ.
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
            <button class="btn btn-success" type="submit" :disabled="saving">
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
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import axios from 'axios'
import Modal from 'bootstrap/js/dist/modal' // ✅ dùng ESM, không dùng window.bootstrap

/* ===== Config ===== */
const API_BASE = 'http://localhost:3000'
const RESOURCE = 'employees'

/* ===== State ===== */
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const employees = ref([])

const alert = reactive({ show: false, message: '', variant: 'success', timer: null })

const isEdit = ref(false)
const submitted = ref(false)
const form = reactive({ id: null, name: '', email: '', phone: '', status: 'active' })

/* ===== Modal ===== */
const modalRef = ref(null)
function getModal() {
  if (!modalRef.value) return null
  return Modal.getOrCreateInstance(modalRef.value, { backdrop: 'static', keyboard: false })
}
function openModal(user = null) {
  isEdit.value = !!user
  submitted.value = false
  user ? Object.assign(form, user) : resetForm()
  getModal()?.show()
}
function closeModal() { getModal()?.hide() }
onBeforeUnmount(() => {
  const inst = Modal.getInstance(modalRef.value)
  inst?.dispose()
})
function resetForm() {
  Object.assign(form, { id: null, name: '', email: '', phone: '', status: 'active' })
}

/* ===== Helpers ===== */
function showAlert(message, variant = 'success', timeout = 2500) {
  alert.message = message
  alert.variant = variant
  alert.show = true
  if (alert.timer) clearTimeout(alert.timer)
  alert.timer = setTimeout(() => (alert.show = false), timeout)
}
function invalidClass(field) { return submitted.value && !form[field] ? 'is-invalid' : '' }
const invalidEmailClass = computed(() => (submitted.value && !isValidEmail(form.email) ? 'is-invalid' : ''))
const invalidPhoneClass = computed(() => (submitted.value && !isValidPhone(form.phone) ? 'is-invalid' : ''))

function isValidEmail(email) { return !!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }
function isValidPhone(phone) { return !!phone && /^0\d{9,10}$/.test(phone) }
function validate() { return !!(form.name && isValidEmail(form.email) && isValidPhone(form.phone)) }

/* ===== CRUD ===== */
async function fetchEmployees() {
  loading.value = true
  error.value = ''
  try {
    const { data } = await axios.get(`${API_BASE}/${RESOURCE}`)
    employees.value = Array.isArray(data) ? data : []
  } catch (e) {
    console.error(e)
    error.value = 'Không tải được danh sách nhân viên.'
  } finally {
    loading.value = false
  }
}

async function save() {
  submitted.value = true
  if (!validate()) return
  saving.value = true
  try {
    const payload = { name: form.name, email: form.email, phone: form.phone, status: form.status }
    if (isEdit.value && form.id != null) {
      await axios.put(`${API_BASE}/${RESOURCE}/${form.id}`, payload)
      const idx = employees.value.findIndex(e => e.id === form.id)
      if (idx !== -1) employees.value.splice(idx, 1, { id: form.id, ...payload }) // ✅ đảm bảo reactivity
      showAlert('Cập nhật nhân viên thành công.', 'success')
    } else {
      const { data } = await axios.post(`${API_BASE}/${RESOURCE}`, payload)
      employees.value.push(data)
      showAlert('Thêm nhân viên thành công.', 'success')
    }
    closeModal()
  } catch (e) {
    console.error(e)
    showAlert('Lưu thất bại. Vui lòng thử lại.', 'danger')
  } finally {
    saving.value = false
  }
}

async function confirmDelete(user) {
  if (!window.confirm(`Xóa nhân viên "${user.name}"?`)) return
  try {
    await axios.delete(`${API_BASE}/${RESOURCE}/${user.id}`)
    employees.value = employees.value.filter(e => e.id !== user.id)
    showAlert('Xóa nhân viên thành công.', 'success')
  } catch (e) {
    console.error(e)
    showAlert('Xóa thất bại. Vui lòng thử lại.', 'danger')
  }
}

const togglingId = ref(null)
async function toggleStatus(user) {
  try {
    togglingId.value = user.id
    const next = user.status === 'active' ? 'inactive' : 'active'
    await axios.patch(`${API_BASE}/${RESOURCE}/${user.id}`, { status: next })
    user.status = next
    showAlert('Cập nhật trạng thái thành công.', 'success')
  } catch (e) {
    console.error(e)
    showAlert('Cập nhật trạng thái thất bại.', 'danger')
  } finally {
    togglingId.value = null
  }
}

/* ===== INIT ===== */
onMounted(fetchEmployees)
</script>

<!-- Global (KHÔNG scoped) cho body/h2) -->
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
.status-active { color: #fff; background-color: #28a745; border-radius: 20px; }
.status-inactive { color: #fff; background-color: #dc3545; border-radius: 20px; }
.btn-delete, .btn-edit { border-radius: 20px; }
.title-underline {
  position: absolute; bottom: -5px; left: 0; width: 80px; height: 4px;
  background: linear-gradient(to right, #28a745, #85e085); border-radius: 2px;
}
</style>
