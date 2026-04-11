<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50">
    <div
      class="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-slate-100"
    >
      <h1 class="text-2xl font-semibold text-slate-900 mb-6 text-center">
        Nak Drive
      </h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Email</label
          >
          <input
            v-model="form.email"
            type="email"
            class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1"
            >Password</label
          >
          <input
            v-model="form.password"
            type="password"
            class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <button
          class="w-full py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
        >
          Sign In
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import api from "@/api/axios";
import { useAuthStore } from "@/stores/auth";

const form = reactive({ email: "", password: "" });
const authStore = useAuthStore();

const handleLogin = async () => {
  try {
    const { data } = await api.post("/auth/login", form);
    console.log(data.success);
    if (data.success === true) {
      authStore.setToken(data.accessToken);
      localStorage.setItem("refresh_token", data.refreshToken);
      alert("เข้าสู่ระบบสำเร็จ");
    } else {
      alert("อีเมลหรือรหัสผ่านผิด");
    }
  } catch (err) {
    alert("เข้าสู่ระบบไม่สำเร็จ");
  }
};
</script>
