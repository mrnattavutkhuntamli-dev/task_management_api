import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Layouts
// หมายเหตุ: หากยังมี Error TS7016 ให้ตรวจสอบไฟล์ src/env.d.ts ว่าได้เพิ่ม declare module "*.vue" หรือยัง
import AdminLayout from '../layouts/AdminLayout.vue'
import UserLayout from '../layouts/UserLayout.vue'

// Views
import LoginView from '../views/auth/LoginView.vue'
import ForgotPasswordView from '../views/auth/ForgotPasswordView.vue'
import ResetPasswordView from '../views/auth/ResetPasswordView.vue'

// Admin & User Views
import DashboardView from '@/views/admin/dashboard/DashboardView.vue'
import TaskListView from '@/views/admin/task/TaskListView.vue'
import UsersView from '@/views/admin/users/UsersView.vue'
import StatusView from '@/views/admin/status_management/Statusview.vue'
import { alertError } from '@/utils/alert'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: LoginView,
    meta: { title: 'เข้าสู่ระบบ | Nak Drive' },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView,
    meta: { title: 'ลืมรหัสผ่าน | Nak Drive' },
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPasswordView,
    meta: { title: 'ตั้งรหัสผ่านใหม่ | Nak Drive' },
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      {
        path: 'dashboard', // ตัด /admin/ ออกเพื่อให้สัมพันธ์กับ parent
        name: 'AdminDashboard',
        component: DashboardView,
        meta: { title: 'แดชบอร์ดผู้ดูแลระบบ | Nak Drive' },
      },
      {
        path: 'tasks',
        name: 'AdminTaskList',
        component: TaskListView,
        meta: { title: 'รายการงาน | Nak Drive' },
      },
      {
        path: 'users',
        name: 'AdminUsers',
        component: UsersView,
        meta: { title: 'ข้อมูลผู้ใช้งาน | Nak Drive' },
      },
      {
        path: 'status-task',
        name: 'StatusTask',
        component: StatusView,
        meta: { title: 'รายการงานสถานะ | Nak Drive' },
      },
    ],
  },
  {
    path: '/user',
    component: UserLayout,
    meta: { requiresAuth: true, roles: ['user'] },
    children: [
      {
        path: 'dashboard',
        name: 'UserDashboard',
        component: DashboardView,
        meta: { title: 'แดชบอร์ดผู้ใช้ | Nak Drive' },
      },
      {
        path: 'tasks',
        name: 'UserTaskList',
        component: TaskListView,
        meta: { title: 'รายการงาน | Nak Drive' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// --- Navigation Guard ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const token = authStore.token
  const userRole = authStore.user?.role || ''
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // 1. ถ้าต้องใช้ Auth แต่ไม่มี Token
  if (requiresAuth && !token) {
    return next({ name: 'Login' })
  }

  // 2. ถ้ามี Token แล้วพยายามเข้าหน้า Auth (Login, Forgot, Reset)
  const authRoutes = ['Login', 'ForgotPassword', 'ResetPassword']
  if (token && to.name && authRoutes.includes(to.name as string)) {
    const destination =
      userRole === 'admin'
        ? 'AdminDashboard'
        : userRole === 'hr'
          ? 'HrDashboard'
          : 'UserDashboard'
    return next({ name: destination })
  }

  // 3. ตรวจสอบสิทธิ์การเข้าถึง (RBAC)
  const requiredRoles = to.meta.roles as string[] | undefined
  if (
    requiredRoles &&
    Array.isArray(requiredRoles) &&
    !requiredRoles.includes(userRole)
  ) {
    alertError('เข้าถึงไม่ได้', 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้')
    // หาหน้า Dashboard ที่เหมาะสมกับ Role จริงๆ ของเขา
    const roleRoutes: Record<string, string> = {
      admin: 'AdminDashboard',
      hr: 'HrDashboard',
      user: 'UserDashboard',
    }
    const safeDestination = roleRoutes[userRole] || 'Login'
    if (to.name === safeDestination) {
      return next({ name: 'Login' })
    }
    return next({ name: safeDestination })
  }
  next()
})

// Page Title
router.afterEach((to) => {
  document.title = (to.meta.title as string) || 'Nak Drive'
})

export default router
