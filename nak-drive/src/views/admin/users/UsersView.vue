<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import dayjs from "dayjs";
import api from "@/api/axios";

// import components
import Pagination from "@/components/common/Pagination.vue";
import SearchFilter from "@/components/common/SearchFilter.vue";

// ---- เก็บข้อมูล ----
const tasks = ref([]); // รายการ tasks ทั้งหมด
const isLoading = ref(false); // สถานะกำลังโหลด

// ---- ข้อมูลการแบ่งหน้า (มาจาก response.meta) ----
const pagination = reactive({
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: 10,
  totalPages: 1,
  currentPage: 1,
});

// ---- พารามิเตอร์สำหรับส่งไป API ----
const queryParams = reactive({
  page: 1,
  limit: 10,
  search: "",
});

// ---- Helper: ดึง assignee หรือ owner อย่างใดอย่างหนึ่ง ----
// เหตุผล: API ส่ง assignee เป็น null แต่มีข้อมูลอยู่ที่ owner
const getAssignee = (task) => task.assignee ?? task.owner ?? null;

// ---- ดึงข้อมูลจาก API ----
const fetchTasks = async () => {
  isLoading.value = true; // เปิด loading
  try {
    const response = await api.get("/task", {
      params: {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined,
      },
    });

    if (response.data.success) {
      tasks.value = response.data.data; // เก็บ tasks
      Object.assign(pagination, response.data.meta); // อัปเดตหน้า
    }
  } catch (error) {
    console.error("Fetch Error:", error);
  } finally {
    isLoading.value = false; // ปิด loading ไม่ว่าจะสำเร็จหรือ error
  }
};

// ---- ค้นหาแบบ Real-time (รอ 500ms หลังพิมพ์เสร็จ) ----
let searchTimer;
watch(
  () => queryParams.search,
  () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      queryParams.page = 1; // ค้นหาใหม่ → กลับหน้า 1 เสมอ
      fetchTasks();
    }, 500);
  },
);

// ---- เปลี่ยนหน้า ----
const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= pagination.totalPages) {
    queryParams.page = newPage;
    fetchTasks();
  }
};

// ---- เปลี่ยนจำนวนรายการต่อหน้า ----
const handleLimitChange = () => {
  queryParams.page = 1; // เปลี่ยน limit → กลับหน้า 1 เสมอ
  fetchTasks();
};

// ---- แปลงวันที่ให้อ่านง่าย ----
const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");

// ---- โหลดข้อมูลครั้งแรกตอนหน้าเปิด ----
onMounted(fetchTasks);
</script>

<template>
  <div class="p-6 lg:p-10 bg-slate-50 min-h-screen font-sans">
    <!-- หัวหน้า + ปุ่ม New Task -->
    <div
      class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
    >
      <div>
        <h2 class="text-3xl font-bold text-slate-900 tracking-tight">
          User Management
        </h2>
        <p class="text-slate-500 mt-1 flex items-center gap-2">
          <span class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
          พบทั้งหมด {{ pagination.totalItems }} รายการ
        </p>
      </div>
      <button
        class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
      >
        <i class="fa-solid fa-plus text-sm"></i>
        New Task
      </button>
    </div>

    <!-- แถบค้นหา + เลือกจำนวนรายการ -->
    <SearchFilter
      v-model:search="queryParams.search"
      v-model:limit="queryParams.limit"
      :placeholder="'ค้นหาข้อมูลพนักงาน...'"
      @change-limit="handleLimitChange"
    />

    <!-- ตาราง Tasks -->
    <div
      class="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden relative transition-all"
    >
      <!-- Overlay ตอนกำลังโหลด -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-20 flex items-center justify-center"
      >
        <i class="fa-solid fa-circle-notch fa-spin text-4xl text-blue-600"></i>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-50/50 border-b border-slate-100">
              <th
                class="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]"
              >
                Task Details
              </th>
              <th
                class="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]"
              >
                Priority
              </th>
              <th
                class="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]"
              >
                Status
              </th>
              <th
                class="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]"
              >
                Assignee
              </th>
              <th
                class="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]"
              >
                Due Date
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="task in tasks"
              :key="task.id"
              class="hover:bg-slate-50/40 transition-colors group"
            >
              <!-- ชื่องาน + labels -->
              <td class="px-6 py-5">
                <div class="flex flex-col gap-1.5">
                  <span
                    class="text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors"
                  >
                    {{ task.title }}
                  </span>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="label in task.labels"
                      :key="label.id"
                      :style="{
                        backgroundColor: label.color + '10',
                        color: label.color,
                        borderColor: label.color + '30',
                      }"
                      class="px-2 py-0.5 rounded-lg text-[10px] font-black border uppercase tracking-tighter"
                    >
                      {{ label.name }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Priority -->
              <td class="px-6 py-5">
                <div
                  :style="{ color: task.priority.color }"
                  class="flex items-center gap-1.5 font-black text-[10px] uppercase"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {{ task.priority.label }}
                </div>
              </td>

              <!-- Status -->
              <td class="px-6 py-5 text-center">
                <span
                  :style="{ backgroundColor: task.status.color }"
                  class="px-4 py-1.5 rounded-xl text-[10px] font-black text-white shadow-sm inline-block min-w-[100px] uppercase tracking-wider"
                >
                  {{ task.status.label }}
                </span>
              </td>

              <!-- Assignee — แก้ไขตรงนี้ ใช้ getAssignee() แทน task.assignee -->
              <td class="px-6 py-5">
                <div v-if="getAssignee(task)" class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-md"
                  >
                    {{ getAssignee(task).name.charAt(0) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-700">{{
                      getAssignee(task).name
                    }}</span>
                    <span class="text-[9px] text-slate-400 font-medium"
                      >Team Member</span
                    >
                  </div>
                </div>
                <div
                  v-else
                  class="text-center italic text-[10px] text-slate-300 font-bold tracking-widest uppercase"
                >
                  No Assignee
                </div>
              </td>

              <!-- Due Date -->
              <td class="px-6 py-5">
                <div class="text-xs font-bold text-slate-600 flex flex-col">
                  <span>{{ formatDate(task.dueDate) }}</span>
                  <span class="text-[10px] text-slate-400 font-medium"
                    >Deadline</span
                  >
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <Pagination
        :currentPage="pagination.currentPage"
        :totalPages="pagination.totalPages"
        @change="handlePageChange"
      />
    </div>
  </div>
</template>
