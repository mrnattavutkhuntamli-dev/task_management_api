<script setup lang="ts">
defineProps<{
  currentPage: number;
  totalPages: number;
}>();

defineEmits(["change"]);
</script>

<template>
  <div
    class="p-6 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center bg-slate-50/20 gap-4"
  >
    <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">
      Page <span class="text-blue-600 font-black">{{ currentPage }}</span> /
      {{ totalPages }}
    </p>
    <div class="flex gap-2">
      <button
        @click="$emit('change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-5 py-2.5 text-xs font-black bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 disabled:opacity-40 transition-all shadow-sm active:scale-95"
      >
        <i class="fa-solid fa-chevron-left mr-1"></i> BACK
      </button>
      <button
        @click="$emit('change', currentPage + 1)"
        :disabled="currentPage === totalPages || totalPages === 0"
        class="px-5 py-2.5 text-xs font-black bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-40 transition-all shadow-md active:scale-95"
      >
        NEXT <i class="fa-solid fa-chevron-right ml-1"></i>
      </button>
    </div>
  </div>
</template>
