<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits(["change"]);

// Logic สำหรับคำนวณตัวเลขหน้าที่จะแสดง (แสดงสูงสุด 5 ปุ่ม)
const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const total = props.totalPages;
  const current = props.currentPage;
  const range = 1; // จำนวนเลขหน้าที่จะโชว์ข้างๆ หน้าปัจจุบัน

  for (let i = 1; i <= total; i++) {
    // โชว์หน้าแรก, หน้าสุดท้าย, และหน้าใกล้เคียงปัจจุบัน
    if (
      i === 1 ||
      i === total ||
      (i >= current - range && i <= current + range)
    ) {
      pages.push(i);
    } else if (i === current - range - 1 || i === current + range + 1) {
      // ใส่ ... คั่นถ้าห่างกันเกิน 1 หน้า
      pages.push("...");
    }
  }

  // กำจัด ... ที่อาจจะซ้ำกัน
  return pages.filter((item, index) => pages.indexOf(item) === index);
});
</script>

<template>
  <div
    class="p-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/20 gap-4"
  >
    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">
      Page <span class="text-blue-600 font-black">{{ currentPage }}</span> /
      {{ totalPages }}
    </p>

    <div class="flex items-center gap-1.5">
      <button
        @click="emit('change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-2 text-xs font-black bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all active:scale-95 mr-2"
      >
        <i class="fa-solid fa-chevron-left"></i>
      </button>

      <template v-for="(page, index) in visiblePages" :key="index">
        <span
          v-if="page === '...'"
          class="px-2 text-slate-400 text-xs font-bold"
          >...</span
        >

        <button
          v-else
          @click="emit('change', page as number)"
          :class="[
            'min-w-[38px] h-[38px] text-xs font-black rounded-xl transition-all active:scale-95',
            currentPage === page
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600',
          ]"
        >
          {{ page }}
        </button>
      </template>

      <button
        @click="emit('change', currentPage + 1)"
        :disabled="currentPage === totalPages || totalPages === 0"
        class="px-3 py-2 text-xs font-black bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-all active:scale-95 ml-2"
      >
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>
