<script lang="ts" setup>
import { ref, reactive, onMounted, watch, computed } from 'vue' // แก้ไข import จาก vue เท่านั้น
import api from '@/api/axios'
import { useFetchList } from '@/composites/admin/users/useFetchList'
import { getUploadUrl } from '@/api/axios'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'
import { alertSuccess, alertError, alertConfirm } from '@/utils/alert'

// Components
import Pagination from '@/components/common/Pagination.vue'
import SearchFilterUser from '@/components/common/SearchFilterUser.vue'
import FormModal from '@/components/common/FormModal.vue'

// 1. Interface
interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  createdAt: string
}

const authStore = useAuthStore()
const fileInput = ref<HTMLInputElement | null>(null)

// 2. Data Fetching & TypeScript Fix
const {
  data: rawData,
  isLoading,
  pagination,
  fetchItems,
} = useFetchList('/users')

// Force Type เพื่อให้ Build ผ่านและใช้งานใน Template ได้ลื่นๆ
const users = computed(() => rawData.value as User[])

// 3. Modal & Form State
const isModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const isSubmitting = ref(false)

const form = reactive({
  id: '',
  name: '',
  email: '',
  role: 'user',
  password: '',
  avatar: '',
  avatarFile: null as File | null,
  avatarPreview: '',
})

const queryParams = reactive({
  page: 1,
  limit: 10,
  search: '',
  role: '',
})

// 4. Logic Functions
const loadData = () => {
  const combinedSearch = `${queryParams.search} ${queryParams.role}`.trim()
  fetchItems({
    page: queryParams.page,
    limit: queryParams.limit,
    search: combinedSearch || undefined,
  })
}

const resetForm = () => {
  form.id = ''
  form.name = ''
  form.email = ''
  form.role = 'user'
  form.password = ''
  form.avatar = ''
  form.avatarFile = null
  form.avatarPreview = ''
}

// --- Image Handlers ---
const triggerFileInput = () => fileInput.value?.click()

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    form.avatarFile = file
    const reader = new FileReader()
    reader.onload = (e) => {
      form.avatarPreview = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const removeSelectedPhoto = () => {
  form.avatarFile = null
  // ถ้าโหมดแก้ไของเดิมมีรูป ให้กลับไปโชว์รูปเดิม
  if (modalMode.value === 'edit' && form.avatar) {
    form.avatarPreview = getUploadUrl(form.avatar)
  } else {
    form.avatarPreview = ''
  }
}

// --- Action Handlers ---
const openCreateModal = () => {
  modalMode.value = 'create'
  resetForm()
  isModalOpen.value = true
}

const handleEdit = (user: User) => {
  if (isMe(user.id)) return
  modalMode.value = 'edit'
  resetForm()
  // Mapping ข้อมูลเข้า Form
  form.id = user.id
  form.name = user.name
  form.email = user.email
  form.role = user.role
  form.avatar = user.avatar || ''
  if (user.avatar) {
    form.avatarPreview = getUploadUrl(user.avatar)
  }
  isModalOpen.value = true
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    // ใช้ FormData สำหรับส่งไฟล์
    const formData = new FormData()
    formData.append('name', form.name)
    formData.append('email', form.email)
    formData.append('role', form.role)
    formData.append('password', form.password)
    if (form.avatarFile) formData.append('file', form.avatarFile)

    if (modalMode.value === 'create') {
      await api.post('/users', formData)
      alertSuccess('เพิ่มข้อมูลพนักงานสำเร็จ')
    } else {
      await api.patch(`/users/${form.id}`, formData)
      alertSuccess('ปรับข้อมูลพนักงานสำเร็จ')
    }
    isModalOpen.value = false
    loadData()
  } catch (error: any) {
    alertError('เกิดข้อผิดพลาด', error.message)
    console.error('Submit Error:', error)
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async (user: User) => {
  isSubmitting.value = true
  try {
    if (isMe(user.id)) {
      alertError(
        'ไม่สามารถดำเนินการได้',
        'คุณไม่สามารถลบชื่อผู้ใช้งานของตัวเองได้',
      )
      return
    }
    const result = await alertConfirm(
      'ยืนยันการลบ?',
      `คุณต้องการลบคุณ ${user.name} ออกจากระบบใช่หรือไม่?`,
    )
    if (!result.isConfirmed) return
    await api.delete(`/users/${user.id}`)
    alertSuccess('ลบข้อมูลพนักงานสำเร็จ')
    loadData()
  } catch (error: any) {
    console.error('Delete Error:', error)
    alertError('เกิดข้อผิดพลาด', error.message)
  } finally {
    isSubmitting.value = false
  }
}

const handleView = (user: User) => {
  ;+console.log('Viewing:', user)
}

const isMe = (userId: string) => authStore.user?.id === userId
const resultText = computed(() =>
  isLoading.value
    ? 'กำลังค้นหาข้อมูล...'
    : `พบพนักงานทั้งหมด ${pagination.totalItems || 0} รายการ`,
)
const formatDate = (date: string) => dayjs(date).format('DD/MM/YYYY')

// Watchers
let searchTimer: any
watch(
  () => queryParams.search,
  () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      queryParams.page = 1
      loadData()
    }, 500)
  },
)
watch(
  () => queryParams.role,
  () => {
    queryParams.page = 1
    loadData()
  },
)
const handlePageChange = (page: number) => {
  queryParams.page = page
  loadData()
}
onMounted(loadData)
</script>

<template>
  <div class="space-y-6 max-w-[1600px] mx-auto p-2 sm:p-0">
    <div
      class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div>
        <h2 class="text-2xl font-black tracking-tight text-slate-800">
          User Management
        </h2>
        <p class="text-[13px] text-slate-400 font-medium mt-0.5">
          {{ resultText }}
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-[13px] font-bold transition-all shadow-lg shadow-blue-100 active:scale-95"
      >
        <i class="fa-solid fa-plus mr-2"></i> Add New User
      </button>
    </div>

    <div class="bg-white p-2 rounded-[28px] border border-slate-100 shadow-sm">
      <SearchFilterUser
        v-model:search="queryParams.search"
        v-model:limit="queryParams.limit"
        v-model:role="queryParams.role"
        @change-limit="loadData"
        @change-filter="loadData"
      />
    </div>

    <div
      class="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden relative min-h-[400px]"
    >
      <div
        v-if="isLoading"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-[2px]"
      >
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-blue-500"></i>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-50">
              <th
                class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400"
              >
                User Info
              </th>
              <th
                class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400"
              >
                Role
              </th>
              <th
                class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400"
              >
                Joined Date
              </th>
              <th
                class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 text-right"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-slate-50/30 transition-colors"
            >
              <td class="px-8 py-5">
                <div class="flex items-center gap-4">
                  <div
                    class="w-11 h-11 rounded-[14px] overflow-hidden border border-slate-100 shadow-sm bg-slate-50 shrink-0"
                  >
                    <img
                      v-if="user.avatar"
                      :src="getUploadUrl(user.avatar)"
                      :alt="user.name"
                      class="w-full h-full object-cover rounded-full"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-white font-black text-sm bg-linear-to-br from-blue-500 to-indigo-600"
                    >
                      {{ user.name?.charAt(0) || 'U' }}
                    </div>
                  </div>
                  <div class="flex flex-col">
                    <span
                      class="text-[14px] font-bold text-slate-700 leading-tight"
                      >{{ user.name }}</span
                    >
                    <span
                      class="text-[11px] text-slate-400 font-medium mt-0.5"
                      >{{ user.email }}</span
                    >
                  </div>
                </div>
              </td>
              <td class="px-6 py-5">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                    user.role?.toLowerCase() === 'admin'
                      ? 'bg-violet-50 text-violet-600'
                      : 'bg-emerald-50 text-emerald-600',
                  ]"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-5 text-[13px] font-bold text-slate-400">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-8 py-5 text-right">
                <div class="flex items-center justify-end gap-2">
                  <template v-if="isMe(user.id)">
                    <span
                      class="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase"
                      >It's You</span
                    >
                  </template>
                  <template v-else-if="user.role?.toLowerCase() === 'admin'">
                    <button
                      @click="handleView(user)"
                      class="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-300 hover:text-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <i class="fa-solid fa-eye"></i>
                    </button>
                  </template>
                  <template v-else>
                    <button
                      @click="handleEdit(user)"
                      class="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      @click="handleDelete(user)"
                      class="w-9 h-9 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="bg-slate-50/30 border-t border-slate-50">
        <Pagination
          :currentPage="pagination.currentPage"
          :totalPages="pagination.totalPages"
          @change="handlePageChange"
        />
      </div>
    </div>

    <FormModal
      :show="isModalOpen"
      :title="
        modalMode === 'create' ? 'Create New Staff' : 'Update Staff Profile'
      "
      @close="isModalOpen = false"
    >
      <div class="space-y-6">
        <div class="flex flex-col items-center gap-4 py-2">
          <label
            class="block text-[10px] font-black uppercase tracking-widest text-slate-400"
            >Profile Photo</label
          >
          <div class="relative group">
            <div
              @click="triggerFileInput"
              class="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-100 shadow-inner bg-slate-50 cursor-pointer transition-all hover:border-blue-100 flex items-center justify-center"
            >
              <img
                v-if="form.avatarPreview"
                :src="form.avatarPreview"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="text-slate-300 flex flex-col items-center gap-1"
              >
                <i class="fa-solid fa-camera text-3xl"></i>
                <span class="text-[10px] font-bold">Upload</span>
              </div>
            </div>
            <button
              v-if="form.avatarPreview"
              @click="removeSelectedPhoto"
              class="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
            >
              <i class="fa-solid fa-trash-can text-sm"></i>
            </button>
          </div>
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            accept="image/*"
            @change="onFileChange"
          />
        </div>

        <div class="space-y-4">
          <div>
            <label
              class="block text-[10px] font-black uppercase text-slate-400 mb-2"
              >Full Name</label
            >
            <input
              v-model="form.name"
              type="text"
              class="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none text-sm font-bold"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label
              class="block text-[10px] font-black uppercase text-slate-400 mb-2"
              >Email Address</label
            >
            <input
              v-model="form.email"
              type="email"
              class="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none text-sm font-bold"
              placeholder="john@example.com"
            />
          </div>
          <label
            class="block text-[10px] font-black uppercase text-slate-400 mb-2"
            >Password</label
          >
          <input
            v-model="form.password"
            type="password"
            class="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none text-sm font-bold"
          />
          <div>
            <label
              class="block text-[10px] font-black uppercase text-slate-400 mb-2"
              >Role</label
            >
            <select
              v-model="form.role"
              class="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none text-sm font-bold appearance-none"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="hr">Hr</option>
            </select>
          </div>
        </div>

        <div class="pt-6 flex gap-3">
          <button
            @click="isModalOpen = false"
            class="flex-1 py-4 text-[13px] font-black text-slate-400 hover:bg-slate-50 rounded-2xl"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[13px] font-black shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
          >
            <span v-if="isSubmitting"
              ><i class="fa-solid fa-circle-notch fa-spin mr-2"></i>
              Processing...</span
            >
            <span v-else>{{
              modalMode === 'create' ? 'Create User' : 'Save Changes'
            }}</span>
          </button>
        </div>
      </div>
    </FormModal>
  </div>
</template>
