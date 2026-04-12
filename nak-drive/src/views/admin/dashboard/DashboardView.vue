<script setup>
import { ref } from "vue";

// ข้อมูลจำลองสำหรับ Stats (เดี๋ยวคุณกอล์ฟค่อยเชื่อมกับ API GET /api/v1/dashboard/status นะครับ)
const stats = ref([
  {
    label: "Total Tasks",
    value: "128",
    trend: "+12%",
    trendText: "จากเดือนที่แล้ว",
    icon: "fa-solid fa-layer-group",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "In Progress",
    value: "43",
    progress: 65,
    icon: "fa-solid fa-spinner",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    isAnimated: true,
  },
  {
    label: "Critical",
    value: "8",
    status: "ต้องการการแก้ไขด่วน",
    icon: "fa-solid fa-triangle-exclamation",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    isPulse: true,
  },
  {
    label: "Active Team",
    value: "12",
    teamAvatars: true,
    icon: "fa-solid fa-user-check",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
]);
</script>

<template>
  <div class="p-6 lg:p-10 bg-slate-50 min-h-screen">
    <div class="mb-10">
      <h2 class="text-3xl font-bold text-slate-900 tracking-tight">Overview</h2>
      <p class="text-slate-500 mt-1">
        สรุปสถานะงานและกิจกรรมทั้งหมดในระบบ Nak Drive
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="(stat, index) in stats"
        :key="index"
        class="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group relative overflow-hidden"
      >
        <div class="flex justify-between items-start">
          <div>
            <p
              class="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1"
            >
              {{ stat.label }}
            </p>
            <h3
              :class="[
                'text-4xl font-bold tracking-tight',
                stat.label === 'Critical' ? 'text-red-600' : 'text-slate-900',
              ]"
            >
              {{ stat.value }}
            </h3>
          </div>

          <div
            :class="[
              'w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3',
              stat.iconBg,
              stat.iconColor,
              { 'animate-pulse': stat.isPulse },
            ]"
          >
            <i
              :class="[stat.icon, { 'animate-spin-slow': stat.isAnimated }]"
            ></i>
          </div>
        </div>

        <div class="mt-6">
          <div v-if="stat.trend" class="flex items-center text-xs">
            <span class="text-emerald-500 font-bold flex items-center">
              <i class="fa-solid fa-arrow-up mr-1"></i> {{ stat.trend }}
            </span>
            <span class="ml-2 text-slate-400 font-medium">{{
              stat.trendText
            }}</span>
          </div>

          <div
            v-if="stat.progress"
            class="w-full bg-slate-100 h-2 rounded-full overflow-hidden"
          >
            <div
              class="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-1000"
              :style="{ width: stat.progress + '%' }"
            ></div>
          </div>

          <div v-if="stat.status" class="text-xs text-slate-500 font-medium">
            {{ stat.status }}
          </div>

          <div v-if="stat.teamAvatars" class="flex -space-x-2 overflow-hidden">
            <div
              v-for="i in 3"
              :key="i"
              class="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-gradient-to-br from-slate-200 to-slate-300 shadow-sm"
            ></div>
            <div
              class="h-7 w-7 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold"
            >
              +9
            </div>
          </div>
        </div>

        <div
          class="absolute -right-4 -bottom-4 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        ></div>
      </div>
    </div>

    <div
      class="mt-10 bg-white rounded-[32px] border border-slate-100 p-8 shadow-sm"
    >
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-slate-900">Recent Activities</h3>
        <button
          class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All
        </button>
      </div>
      <div
        class="flex flex-col items-center justify-center py-20 text-slate-300"
      >
        <i class="fa-solid fa-inbox text-5xl mb-4 opacity-20"></i>
        <p class="font-medium tracking-wide">ยังไม่มีข้อมูลกิจกรรมใหม่</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* สำหรับอนิเมชั่นที่ Tailwind พื้นฐานไม่มี */
.animate-spin-slow {
  animation: spin 4s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
