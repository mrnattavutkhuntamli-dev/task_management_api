<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api/axios'
import { useAuthStore } from '../../stores/auth'
import { alertError, alertSuccess } from '../../utils/alert'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const remember = ref(false)
const isPasswordVisible = ref(false)
const isLoading = ref(false)

const errors = reactive({ email: '', password: '' })

const validateEmail = () => {
  if (!form.email) {
    errors.email = 'กรุณากรอกอีเมล'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง'
  } else {
    errors.email = ''
  }
}

const validatePassword = () => {
  if (!form.password) {
    errors.password = 'กรุณากรอกรหัสผ่าน'
  } else if (form.password.length < 6) {
    errors.password = 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'
  } else {
    errors.password = ''
  }
}

const isFormValid = computed(() => {
  return (
    form.email.length > 0 &&
    form.password.length > 0 &&
    !errors.email &&
    !errors.password
  )
})

const handleLogin = async () => {
  validateEmail()
  validatePassword()
  if (!isFormValid.value) return

  isLoading.value = true
  try {
    const { data } = await api.post('/auth/login', form)

    if (data.statusCode == 200 || data.statusCode == 201) {
      const { access_token, user } = data.data
      const payload = {
        id: user.id,
        name: user.name,
        role: user.role,
      }
      authStore.setToken(access_token)
      authStore.setUser(payload)
      let pathRedirect = { name: '/' }
      alertSuccess('เข้าสู่ระบบสำเร็จ', 'เข้าสู่ระบบเรียบร้อยแล้ว')
      if (payload.role === 'admin') {
        pathRedirect = { name: 'AdminDashboard' }
      }
      if (payload.role === 'user') {
        pathRedirect = { name: 'UserDashboard' }
      }
      alertSuccess('เข้าสู่ระบบสำเร็จ', 'เข้าสู่ระบบเรียบร้อยแล้ว')
      router.push(pathRedirect)
    } else {
      alertError(
        'เข้าสู่ระบบไม่สำเร็จ',
        'ข้อมูลไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
      )
    }
  } catch (err: any) {
    console.error('Login Error:', err)
    // ดึง message จาก Backend มาโชว์จะดูเป็นมืออาชีพกว่าครับ
    const errorMsg =
      err.response?.data?.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
    alertError('เข้าสู่ระบบไม่สำเร็จ', errorMsg)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-[#0a0a0a] flex flex-col justify-center items-center p-4 relative overflow-hidden"
  >
    <!-- Background decorative blobs -->
    <div
      class="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"
    ></div>
    <div
      class="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-slate-500/10 rounded-full blur-3xl pointer-events-none"
    ></div>

    <div class="w-full max-w-md relative z-10">
      <!-- Card -->
      <div
        class="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
      >
        <!-- Header -->
        <div class="pt-10 pb-8 px-8 text-center">
          <div
            class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/40 mb-5"
          >
            <i class="fa-solid fa-headset text-2xl text-white"></i>
          </div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">
            Task<span class="text-blue-400"> Management</span>
          </h1>
          <p class="text-slate-400 text-sm mt-2">
            ยินดีต้อนรับเข้าสู่ระบบ Task Management
          </p>
        </div>

        <!-- Form -->
        <div class="px-8 pb-10">
          <form @submit.prevent="handleLogin" class="space-y-5" novalidate>
            <!-- Email -->
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
                  v-model="form.email"
                  @blur="validateEmail"
                  type="email"
                  autocomplete="email"
                  class="block w-full pl-11 pr-4 py-3 bg-white/5 border rounded-2xl text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2"
                  :class="
                    errors.email
                      ? 'border-red-500/60 focus:ring-red-500/30'
                      : 'border-white/10 focus:border-blue-500/60 focus:ring-blue-500/20'
                  "
                  placeholder="name@company.com"
                />
              </div>
              <p
                v-if="errors.email"
                class="mt-1.5 text-xs text-red-400 font-medium ml-1 flex items-center gap-1"
              >
                <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                {{ errors.email }}
              </p>
            </div>

            <!-- Password -->
            <div>
              <div class="mb-2">
                <label
                  class="block text-xs font-bold text-slate-400 uppercase tracking-widest"
                  >Password</label
                >
              </div>
              <div class="relative group">
                <div
                  class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                >
                  <i
                    class="fa-solid fa-lock text-slate-500 group-focus-within:text-blue-400 transition-colors"
                  ></i>
                </div>
                <input
                  v-model="form.password"
                  @blur="validatePassword"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  autocomplete="password"
                  class="block w-full pl-11 pr-12 py-3 bg-white/5 border rounded-2xl text-sm text-white placeholder-slate-500 transition-all duration-200 focus:outline-none focus:ring-2"
                  :class="
                    errors.password
                      ? 'border-red-500/60 focus:ring-red-500/30'
                      : 'border-white/10 focus:border-blue-500/60 focus:ring-blue-500/20'
                  "
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  @click="isPasswordVisible = !isPasswordVisible"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                  tabindex="-1"
                >
                  <i
                    class="fa-solid"
                    :class="isPasswordVisible ? 'fa-eye-slash' : 'fa-eye'"
                  ></i>
                </button>
              </div>
              <p
                v-if="errors.password"
                class="mt-1.5 text-xs text-red-400 font-medium ml-1 flex items-center gap-1"
              >
                <i class="fa-solid fa-circle-exclamation text-[10px]"></i>
                {{ errors.password }}
              </p>
            </div>

            <!-- Remember me + Forgot password -->
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                  id="remember-me"
                  v-model="remember"
                  type="checkbox"
                  class="h-4 w-4 accent-blue-500 border-slate-600 rounded cursor-pointer"
                />
                <label
                  for="remember-me"
                  class="ml-2 block text-sm text-slate-400 cursor-pointer select-none hover:text-slate-200 transition-colors"
                  >จำการเข้าใช้งาน</label
                >
              </div>
              <router-link
                to="/forgot-password"
                class="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                ลืมรหัสผ่าน?
              </router-link>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              :disabled="isLoading || !isFormValid"
              class="w-full relative flex justify-center items-center py-3.5 px-4 rounded-2xl text-sm font-bold text-white transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
              :class="
                isFormValid && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'
                  : 'bg-slate-700 shadow-slate-900/30'
              "
            >
              <span v-if="!isLoading" class="flex items-center gap-2">
                เข้าสู่ระบบ
                <i class="fa-solid fa-arrow-right text-xs"></i>
              </span>
              <div v-else class="flex items-center space-x-1.5">
                <div
                  class="w-2 h-2 bg-white rounded-full"
                  style="animation: dot-bounce 0.6s infinite alternate"
                ></div>
                <div
                  class="w-2 h-2 bg-white rounded-full"
                  style="animation: dot-bounce 0.6s 0.15s infinite alternate"
                ></div>
                <div
                  class="w-2 h-2 bg-white rounded-full"
                  style="animation: dot-bounce 0.6s 0.3s infinite alternate"
                ></div>
              </div>
            </button>
          </form>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-6 text-center">
        <p class="text-xs text-slate-600">
          &copy; 2025 Task Management System. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes dot-bounce {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-5px);
    opacity: 0.5;
  }
}
</style>
