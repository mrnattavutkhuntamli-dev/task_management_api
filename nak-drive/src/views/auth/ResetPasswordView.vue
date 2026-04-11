<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../../api/axios";

import { alertError, alertSuccess } from "../../utils/alert";

const route = useRoute();
const router = useRouter();

const token = ref("");
const isLoading = ref(false);
const isPasswordVisible = ref(false);

const form = reactive({
  password: "",
  confirmPassword: "",
});

const errors = reactive({
  password: "",
  confirmPassword: "",
});

onMounted(() => {
  // ดึง token จาก URL (?token=xxxx)
  const tokenQuery = route.query.token as string;
  if (!tokenQuery) {
    alertError("เกิดข้อผิดพลาด", "Token ไม่ถูกต้องหรือไม่พบ Token");
    router.push({ name: "Login" });
  } else {
    token.value = tokenQuery;
  }
});

const validateForm = () => {
  let isValid = true;
  if (form.password.length < 6) {
    errors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    isValid = false;
  } else {
    errors.password = "";
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
    isValid = false;
  } else {
    errors.confirmPassword = "";
  }
  return isValid;
};

const handleResetPassword = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    // ยิงไปที่ Backend (Port 3000) ตาม Endpoint ที่คุณกอล์ฟทำไว้
    await api.post("/auth/reset-password", {
      token: token.value,
      newPassword: form.password,
    });

    await alertSuccess("สำเร็จ!", "เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว");
    router.push({ name: "Login" });
  } catch (err: any) {
    const msg =
      err.response?.data?.message ||
      "ไม่สามารถเปลี่ยนรหัสผ่านได้ Token อาจหมดอายุ";
    alertError("เกิดข้อผิดพลาด", msg);
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
      <div
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-8"
      >
        <div class="text-center mb-8">
          <div
            class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 mb-4"
          >
            <i class="fa-solid fa-shield-halved text-xl text-white"></i>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight">
            ตั้งรหัสผ่านใหม่
          </h1>
          <p class="text-slate-400 text-sm mt-2">
            กรุณาระบุรหัสผ่านใหม่ที่คุณต้องการใช้งาน
          </p>
        </div>

        <form @submit.prevent="handleResetPassword" class="space-y-5">
          <div>
            <label
              class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2"
              >New Password</label
            >
            <div class="relative group">
              <input
                v-model="form.password"
                :type="isPasswordVisible ? 'text' : 'password'"
                class="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="isPasswordVisible = !isPasswordVisible"
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300"
              >
                <i
                  class="fa-solid"
                  :class="isPasswordVisible ? 'fa-eye-slash' : 'fa-eye'"
                ></i>
              </button>
            </div>
            <p
              v-if="errors.password"
              class="mt-1.5 text-xs text-red-400 font-medium ml-1"
            >
              {{ errors.password }}
            </p>
          </div>

          <div>
            <label
              class="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2"
              >Confirm Password</label
            >
            <input
              v-model="form.confirmPassword"
              :type="isPasswordVisible ? 'text' : 'password'"
              class="block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all"
              placeholder="••••••••"
            />
            <p
              v-if="errors.confirmPassword"
              class="mt-1.5 text-xs text-red-400 font-medium ml-1"
            >
              {{ errors.confirmPassword }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] flex justify-center items-center"
          >
            <span v-if="!isLoading">ยืนยันการเปลี่ยนรหัสผ่าน</span>
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
    </div>
  </div>
</template>
