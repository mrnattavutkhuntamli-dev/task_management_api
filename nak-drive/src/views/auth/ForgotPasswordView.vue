<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const email = ref("");
const isLoading = ref(false);
const isSubmitted = ref(false);
const error = ref("");

const validateEmail = (val: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
};

const handleResetPassword = async () => {
  if (!validateEmail(email.value)) {
    error.value = "กรุณากรอกอีเมลที่ถูกต้อง";
    return;
  }

  error.value = "";
  isLoading.value = true;

  try {
    // เชื่อมต่อ API ของคุณกอล์ฟที่นี่ (e.g., api.post('/auth/forgot-password', { email }))
    await new Promise((r) => setTimeout(r, 2000)); // Simulate API
    isSubmitted.value = true;
  } catch (err) {
    error.value = "ไม่พบอีเมลนี้ในระบบ";
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div
    class="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center p-4 relative overflow-hidden"
  >
    <div
      class="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
    ></div>

    <div class="w-full max-w-md relative z-10">
      <button
        @click="router.push({ name: 'Login' })"
        class="mb-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium group"
      >
        <i
          class="fa-solid fa-arrow-left transition-transform group-hover:-translate-x-1"
        ></i>
        กลับไปหน้าเข้าสู่ระบบ
      </button>

      <div
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-8"
      >
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800 border border-white/10 shadow-lg mb-4"
          >
            <i class="fa-solid fa-key text-xl text-blue-400"></i>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight">
            ลืมรหัสผ่าน?
          </h1>
          <p class="text-slate-400 text-sm mt-2">
            ไม่ต้องกังวล เราจะส่งคำแนะนำการตั้งรหัสผ่านใหม่ไปให้คุณ
          </p>
        </div>

        <div v-if="isSubmitted" class="text-center py-4">
          <div
            class="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 mb-6"
          >
            <i
              class="fa-solid fa-circle-check text-4xl text-green-400 mb-3"
            ></i>
            <h3 class="text-white font-semibold">ส่งอีเมลเรียบร้อยแล้ว</h3>
            <p class="text-slate-400 text-sm mt-1">
              โปรดตรวจสอบกล่องจดหมายของท่าน
            </p>
          </div>
          <button
            @click="isSubmitted = false"
            class="text-blue-400 hover:text-blue-300 text-sm font-semibold"
          >
            ไม่ได้รับอีเมล? ส่งอีกครั้ง
          </button>
        </div>

        <form v-else @submit.prevent="handleResetPassword" class="space-y-6">
          <div>
            <label
              class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2"
              >Email Address</label
            >
            <div class="relative group">
              <div
                class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
              >
                <i
                  class="fa-regular fa-envelope text-slate-500 group-focus-within:text-blue-400 transition-colors"
                ></i>
              </div>
              <input
                v-model="email"
                type="email"
                placeholder="name@company.com"
                class="block w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                :class="{ 'border-red-500/50': error }"
              />
            </div>
            <p
              v-if="error"
              class="mt-2 text-xs text-red-400 flex items-center gap-1"
            >
              <i class="fa-solid fa-circle-exclamation"></i> {{ error }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading || !email"
            class="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex justify-center items-center"
          >
            <span v-if="!isLoading">ส่งลิงก์รีเซ็ตรหัสผ่าน</span>
            <div v-else class="flex gap-1">
              <div
                class="w-1.5 h-1.5 bg-white rounded-full animate-bounce"
              ></div>
              <div
                class="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.2s]"
              ></div>
              <div
                class="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:0.4s]"
              ></div>
            </div>
          </button>
        </form>
      </div>

      <p class="mt-8 text-center text-xs text-slate-600">
        ต้องการความช่วยเหลือ?
        <a href="#" class="text-slate-400 hover:text-blue-400 transition-colors"
          >ติดต่อฝ่ายดูแลระบบ</a
        >
      </p>
    </div>
  </div>
</template>
