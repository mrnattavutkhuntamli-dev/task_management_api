<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import dayjs from "dayjs";
import axios from "axios";

// --- 1. State Management ---
const tasks = ref([]);
const isLoading = ref(false);

const pagination = reactive({
  totalItems: 0,
  itemCount: 0,
  itemsPerPage: 10,
  totalPages: 1,
  currentPage: 1,
});

const queryParams = reactive({
  page: 1,
  limit: 10,
  search: "",
});

// --- 2. API Integration ---
const fetchTasks = async () => {
  isLoading.value = true;
  try {
    const response = await axios.get("http://localhost:3000/api/v1/tasks", {
      params: {
        page: queryParams.page,
        limit: queryParams.limit,
        search: queryParams.search || undefined, // ถ้าไม่มีค่าไม่ต้องส่ง
      },
      // headers: { Authorization: `Bearer ${your_token}` } // อย่าลืมใส่ Token ถ้ามี
    });

    if (response.data.success) {
      tasks.value = response.data.data;
      // Map meta data เข้ากับ pagination state
      Object.assign(pagination, response.data.meta);
    }
  } catch (error) {
    console.error("Fetch Error:", error);
    // กรณี Error  Toast แจ้งเตือนตรงนี้
  } finally {
    isLoading.value = false;
  }
};

// --- 3. Watchers & Logic ---

// ค้นหาแบบ Real-time (Debounce)
let searchTimer;
watch(
  () => queryParams.search,
  () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      queryParams.page = 1; // ค้นหาใหม่ต้องเริ่มหน้า 1 เสมอ
      fetchTasks();
    }, 500);
  },
);

// เปลี่ยนหน้า หรือเปลี่ยน Limit
const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= pagination.totalPages) {
    queryParams.page = newPage;
    fetchTasks();
  }
};

const handleLimitChange = () => {
  queryParams.page = 1;
  fetchTasks();
};

onMounted(fetchTasks);

// Helper Functions
const formatDate = (date) => dayjs(date).format("DD/MM/YYYY");
</script>

<template>
  <div class="p-6 lg:p-10 bg-slate-50 min-h-screen font-sans">
    <div
      class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
    >
      <div>
        <h2 class="text-3xl font-bold text-slate-900 tracking-tight">
          Task Management
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

    <div
      class="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center"
    >
      <div class="relative flex-1 min-w-[280px]">
        <i
          class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        ></i>
        <input
          v-model="queryParams.search"
          type="text"
          placeholder="ค้นหางานของคุณ..."
          class="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10 transition-all text-sm outline-none text-slate-700"
        />
      </div>

      <div class="flex items-center gap-3">
        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider"
          >Show:</span
        >
        <select
          v-model="queryParams.limit"
          @change="handleLimitChange"
          class="bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/10 outline-none"
        >
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
        </select>
      </div>
    </div>

    <div
      class="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden relative transition-all"
    >
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
              <td class="px-6 py-5">
                <div
                  :style="{ color: task.priority.color }"
                  class="flex items-center gap-1.5 font-black text-[10px] uppercase"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {{ task.priority.label }}
                </div>
              </td>
              <td class="px-6 py-5 text-center">
                <span
                  :style="{ backgroundColor: task.status.color }"
                  class="px-4 py-1.5 rounded-xl text-[10px] font-black text-white shadow-sm inline-block min-w-[100px] uppercase tracking-wider"
                >
                  {{ task.status.label }}
                </span>
              </td>
              <td class="px-6 py-5">
                <div v-if="task.assignee" class="flex items-center gap-2">
                  <div
                    class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-[11px] font-bold text-white shadow-md"
                  >
                    {{ task.assignee.name.charAt(0) }}
                  </div>
                  <div class="flex flex-col">
                    <span class="text-xs font-bold text-slate-700">{{
                      task.assignee.name
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

      <div
        class="p-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/20 gap-4"
      >
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Page
          <span class="text-blue-600 font-black">{{
            pagination.currentPage
          }}</span>
          / {{ pagination.totalPages }}
        </p>

        <div class="flex gap-2">
          <button
            @click="handlePageChange(queryParams.page - 1)"
            :disabled="queryParams.page === 1"
            class="px-5 py-2.5 text-xs font-black bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
          >
            <i class="fa-solid fa-chevron-left mr-1"></i> BACK
          </button>
          <button
            @click="handlePageChange(queryParams.page + 1)"
            :disabled="queryParams.page === pagination.totalPages"
            class="px-5 py-2.5 text-xs font-black bg-blue-600 text-white border border-blue-600 rounded-2xl hover:bg-blue-700 disabled:opacity-40 disabled:bg-slate-300 disabled:border-slate-300 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
          >
            NEXT <i class="fa-solid fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
