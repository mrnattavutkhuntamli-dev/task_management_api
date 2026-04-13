<script setup lang="ts">
// เพิ่ม Props ให้ยืดหยุ่นขึ้น
defineProps<{
  search: string;
  limit: number;
  role: string;
  placeholder?: string; // คำค้นหาที่จะเปลี่ยนไปตามหน้า
  showLabel?: string; // คำโปรยหน้า Select (ถ้าอยากเปลี่ยน)
}>();

defineEmits([
  "update:search",
  "update:limit",
  "update:role",
  "change-limit",
  "change-filter",
]);
</script>

<template>
  <div
    class="bg-white p-4 rounded-[28px] shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-4 items-center"
  >
    <div class="relative flex-1 min-w-[280px]">
      <i
        class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
      ></i>
      <input
        :value="search"
        @input="
          $emit('update:search', ($event.target as HTMLInputElement).value)
        "
        type="text"
        :placeholder="placeholder || 'ค้นหาข้อมูล...'"
        class="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10 transition-all text-sm outline-none"
      />
    </div>

    <div class="flex items-center gap-2">
      <select
        :value="role"
        @change="
          $emit('update:role', ($event.target as HTMLSelectElement).value);
          $emit('change-filter');
        "
        class="bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/10 outline-none"
      >
        <option value="">All Roles</option>
        <option value="admin">Admin</option>
        <option value="hr">hr</option>
        <option value="user">user</option>
      </select>
    </div>

    <div class="flex items-center gap-3">
      <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">
        {{ showLabel || "Show" }}:
      </span>
      <select
        :value="limit"
        @change="
          $emit(
            'update:limit',
            Number(($event.target as HTMLSelectElement).value),
          );
          $emit('change-limit');
        "
        class="bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-500/10 outline-none"
      >
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
    </div>
  </div>
</template>
