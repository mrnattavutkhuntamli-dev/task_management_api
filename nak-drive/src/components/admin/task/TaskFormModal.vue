<script setup lang="ts">
import { reactive } from "vue";

// รับ Props เพื่อควบคุมการเปิด-ปิด
defineProps<{ isVisible: boolean }>();
// ส่ง Event กลับไปหาตัวแม่เมื่อต้องการปิด หรือบันทึกสำเร็จ
const emit = defineEmits(["close", "refresh"]);

const form = reactive({
  title: "",
  priority: "low",
  dueDate: "",
  description: "",
});

const handleSave = () => {
  console.log("บันทึกข้อมูล:", form);
  // ตรงนี้คุณกอล์ฟค่อยเรียกใช้ axios.post('/tasks', form) นะครับ
  emit("refresh"); // บอกหน้าหลักให้โหลดตารางใหม่
  emit("close"); // ปิด Modal
};
</script>

<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <div
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      @click="$emit('close')"
    ></div>

    <div
      class="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-200"
    >
      <div class="p-8">
        <h3 class="text-2xl font-bold text-slate-900 mb-6">สร้างงานใหม่</h3>

        <div class="space-y-5">
          <div>
            <label
              class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1"
              >หัวข้อหลัก</label
            >
            <input
              v-model="form.title"
              type="text"
              placeholder="ระบุชื่อ Task..."
              class="w-full mt-2 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1"
                >ความสำคัญ</label
              >
              <select
                v-model="form.priority"
                class="w-full mt-2 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-bold text-slate-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label
                class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1"
                >กำหนดส่ง</label
              >
              <input
                v-model="form.dueDate"
                type="date"
                class="w-full mt-2 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        <div class="mt-10 flex gap-3">
          <button
            @click="$emit('close')"
            class="flex-1 py-4 text-xs font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all tracking-widest"
          >
            CANCEL
          </button>
          <button
            @click="handleSave"
            class="flex-1 py-4 text-xs font-black bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/25 hover:bg-blue-700 active:scale-95 transition-all tracking-widest"
          >
            CREATE TASK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
