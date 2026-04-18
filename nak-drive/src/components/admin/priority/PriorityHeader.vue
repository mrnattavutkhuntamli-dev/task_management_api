<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h2 class="text-2xl font-black tracking-tight text-slate-800">
        Priority Management
      </h2>
      <p class="text-[13px] text-slate-400 font-medium mt-0.5">
        จำนวนข้อมูลสถานะความสำคัญที่มีอยู่ในระบบ {{ total }} รายการ
      </p>
    </div>
    <button
      @click="$emit('add')"
      class="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl text-[13px] font-bold transition-all shadow-lg shadow-green-100 active:scale-95 cursor-pointer"
    >
      <i class="fa-solid fa-plus mr-2"></i> Add New Priority
    </button>
  </div>
</template>

<script setup>
defineProps(['total'])
defineEmits(['add'])
</script>
