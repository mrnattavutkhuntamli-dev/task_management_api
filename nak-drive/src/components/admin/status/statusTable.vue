<template>
  <div
    class="bg-white p-2 rounded-[28px] border border-slate-100 shadow-sm overflow-hidden relative min-h-[400px]"
  >
    <div
      v-if="loading"
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
              Status Info
            </th>
            <th
              class="px-6 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400"
            >
              Sort Order
            </th>
            <th
              class="px-8 py-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 text-right"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in items"
            :key="item.id"
            class="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0"
          >
            <td class="px-8 py-5">
              <div class="flex items-center gap-4">
                <div
                  class="w-3 h-3 rounded-full shadow-sm"
                  :style="{ backgroundColor: item.color }"
                ></div>
                <div>
                  <div class="text-[14px] font-bold text-slate-700">
                    {{ item.label }}
                  </div>
                  <div
                    class="text-[11px] text-slate-400 font-medium tracking-wide uppercase"
                  >
                    Key: {{ item.key }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-5">
              <span
                class="px-3 py-1 rounded-full text-[11px] font-bold border"
                :style="{
                  backgroundColor: item.color + '10',
                  color: item.color,
                  borderColor: item.color + '25',
                }"
              >
                Order: {{ item.sortOrder }}
              </span>
            </td>
            <td class="px-8 py-5 text-right">
              <div class="flex justify-end gap-2">
                <button
                  @click="$emit('edit', item)"
                  class="p-2.5 hover:bg-blue-50 text-blue-600 rounded-xl transition-colors cursor-pointer"
                >
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button
                  @click="$emit('delete', item)"
                  class="p-2.5 hover:bg-red-50 text-red-600 rounded-xl transition-colors cursor-pointer"
                >
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps(['items', 'loading'])
defineEmits(['edit', 'delete'])
</script>
