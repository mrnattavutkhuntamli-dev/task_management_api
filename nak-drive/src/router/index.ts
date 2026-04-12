import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth"; // นำ Store มาใช้แทน sessionStorage

import AdminLayout from "../layouts/AdminLayout.vue";
import UserLayout from "../layouts/UserLayout.vue";

// Layouts
import LoginView from "../views/auth/LoginView.vue";
import ForgotPasswordView from "../views/auth/ForgotPasswordView.vue";
import ResetPasswordView from "../views/auth/ResetPasswordView.vue";

// Admin
import DashboardView from "@/views/admin/dashboard/DashboardView.vue";
import TaskListView from "@/views/admin/task/TaskListView.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Login",
      component: LoginView, // ย้ายไปโฟลเดอร์ views
      meta: { title: "เข้าสู่ระบบ | Nak Drive" },
    },

    {
      path: "/forgot-password",
      name: "ForgotPassword",
      component: ForgotPasswordView,
      meta: { title: "ลืมรหัสผ่าน | Nak Drive" },
    },
    {
      path: "/reset-password",
      name: "ResetPassword",
      component: ResetPasswordView,
      meta: { title: "ตั้งรหัสผ่านใหม่ | Nak Drive" },
    },

    {
      path: "/admin",
      component: AdminLayout,
      meta: { requiresAuth: true, roles: ["admin"] },
      children: [
        {
          path: "/admin/dashboard",
          name: "AdminDashboard",
          component: DashboardView,
          meta: { title: "แผนการผู้ใช้ | Nak Drive" },
        },
        {
          path: "/admin/tasks",
          name: "AdminTaskList",
          component: TaskListView,
          meta: { title: "รายการงาน | Nak Drive" },
        },
      ],
    },
    {
      path: "/user",
      component: UserLayout,
      meta: { requiresAuth: true, roles: ["user"] },
      children: [
        {
          path: "/user/dashboard",
          name: "UserDashboard",
          component: DashboardView,
          meta: { title: "แผนการผู้ใช้ | Nak Drive" },
        },
        {
          path: "/user/tasks",
          name: "UserTaskList",
          component: TaskListView,
          meta: { title: "รายการงาน | Nak Drive" },
        },
      ],
    },
  ],
});

// --- Navigation Guard (แบบปรับปรุง) ---
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const token = authStore.token;
  const userRole = authStore.user?.role || "";

  // 1. ถ้าต้องใช้ Auth แต่ไม่มี Token -> ไป Login
  if (requiresAuth && !token) {
    return next({ name: "Login" });
  }

  // 2. ถ้ามี Token แล้วพยายามเข้าหน้า Auth (Login, Forgot, Reset)
  // ให้ดีดไปหน้า Dashboard ตาม Role
  const authRoutes = ["Login", "ForgotPassword", "ResetPassword"];
  if (to.name && authRoutes.includes(to.name as string) && token) {
    if (userRole === "admin") {
      return next({ name: "AdminDashboard" });
    } else {
      return next({ name: "UserDashboard" });
    }
  }
  // 3. ตรวจสอบสิทธิ์การเข้าถึง (RBAC) - เพิ่มเติมให้ถ้ามีกำหนด meta.roles
  const requiredRoles = to.meta.roles as string[];
  if (requiredRoles && !requiredRoles.includes(userRole)) {
    alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
    return next(from.path !== "/" ? from.path : { name: "UserDashboard" });
  }
  // 4. กรณีอื่นๆ ทั้งหมดที่ผ่านมาถึงตรงนี้ ให้ผ่านไปได้เลย
  next();
});

// Page Title
router.afterEach((to) => {
  document.title = (to.meta.title as string) || "Nak Drive";
});

export default router;
