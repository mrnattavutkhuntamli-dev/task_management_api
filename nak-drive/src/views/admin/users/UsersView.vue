<script setup>
import { reactive, onMounted, watch } from "vue";
import { useFetchList } from "@/composites/admin/users/useFetchList"; // เรียกใช้ Composable
import { getUploadUrl } from "@/api/axios";
import dayjs from "dayjs";

// Components
import Pagination from "@/components/common/Pagination.vue";
import SearchFilterUser from "@/components/common/SearchFilterUser.vue";

// ใช้ Composable จัดการเรื่องการดึงข้อมูลพนักงาน
const {
  data: users,
  isLoading,
  pagination,
  fetchItems,
} = useFetchList("/users");

const queryParams = reactive({
  page: 1,
  limit: 10,
  search: "",
  role: "",
});

// เรียก Fetch ข้อมูล
const loadData = () => {
  const combinedSearch = `${queryParams.search} ${queryParams.role}`.trim();
  fetchItems({
    page: queryParams.page,
    limit: queryParams.limit,
    search: combinedSearch || undefined,
  });
};
// Watcher สำหรับค้นหา (Debounce)
let searchTimer;
watch(
  () => queryParams.search,
  () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      queryParams.page = 1;
      loadData();
    }, 500);
  },
);

const handlePageChange = (page) => {
  queryParams.page = page;
  loadData();
};

const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");

onMounted(loadData);
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-xl font-bold" style="color: #1e293b">
          User Management
        </h2>
        <p class="text-[13px] mt-0.5" style="color: #94a3b8">
          จัดการสมาชิกทั้งหมดในระบบ
        </p>
      </div>
    </div>

    <!-- Search Filter -->
    <div
      class="p-4 rounded-2xl"
      style="background: #ffffff; border: 1px solid #e8ecf0"
    >
      <SearchFilterUser
        v-model:search="queryParams.search"
        v-model:limit="queryParams.limit"
        v-model:role="queryParams.role"
        placeholder="ค้นหาชื่อพนักงาน หรืออีเมล..."
        @change-limit="loadData"
        @change-filter="loadData"
      />
    </div>

    <!-- Table Card -->
    <div
      class="rounded-2xl overflow-hidden relative"
      style="background: #ffffff; border: 1px solid #e8ecf0"
    >
      <!-- Loading Overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3"
        style="background: rgba(255, 255, 255, 0.75)"
      >
        <i
          class="fa-solid fa-circle-notch fa-spin text-2xl"
          style="color: #3b82f6"
        ></i>
        <p class="text-[12px]" style="color: #94a3b8">กำลังโหลด...</p>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 1px solid #e8ecf0">
              <th
                class="px-6 py-4 text-[10px] font-black uppercase tracking-wider"
                style="color: #94a3b8"
              >
                User Info
              </th>
              <th
                class="px-6 py-4 text-[10px] font-black uppercase tracking-wider"
                style="color: #94a3b8"
              >
                Role
              </th>
              <th
                class="px-6 py-4 text-[10px] font-black uppercase tracking-wider"
                style="color: #94a3b8"
              >
                Joined Date
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="group transition-colors duration-150"
              style="border-bottom: 1px solid #f8fafc"
              onmouseenter="this.style.backgroundColor = '#fafbfc'"
              onmouseleave="this.style.backgroundColor = 'transparent'"
            >
              <!-- User Info -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl overflow-hidden shrink-0"
                    style="border: 1px solid #e2e8f0"
                  >
                    <img
                      v-if="user.avatar"
                      :src="`${getUploadUrl(user.avatar)}`"
                      :alt="user.name"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      class="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                      style="
                        background: linear-gradient(135deg, #3b82f6, #6366f1);
                      "
                    >
                      {{ user.name.charAt(0) }}
                    </div>
                  </div>
                  <div>
                    <p class="text-[13px] font-semibold" style="color: #1e293b">
                      {{ user.name }}
                    </p>
                    <p class="text-[11px] mt-0.5" style="color: #94a3b8">
                      {{ user.email }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Role -->
              <td class="px-6 py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                  :style="
                    user.role === 'admin'
                      ? 'background:#ede9fe; color:#8b5cf6;'
                      : 'background:#ecfdf5; color:#10b981;'
                  "
                >
                  <i
                    :class="[
                      'fa-solid text-[9px]',
                      user.role === 'admin' ? 'fa-shield-halved' : 'fa-user',
                    ]"
                  ></i>
                  {{ user.role }}
                </span>
              </td>

              <!-- Joined Date -->
              <td class="px-6 py-4 text-[13px]" style="color: #94a3b8">
                {{ formatDate(user.createdAt) }}
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="!isLoading && (!users || users.length === 0)">
              <td colspan="3" class="px-6 py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div
                    class="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style="background: #f1f5f9"
                  >
                    <i
                      class="fa-solid fa-users text-lg"
                      style="color: #cbd5e1"
                    ></i>
                  </div>
                  <p class="text-[13px] font-semibold" style="color: #94a3b8">
                    ไม่พบข้อมูลผู้ใช้
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div style="border-top: 1px solid #f1f5f9" class="px-6 py-4">
        <Pagination
          :currentPage="pagination.currentPage"
          :totalPages="pagination.totalPages"
          @change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>
