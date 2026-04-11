import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth"; // นำ Store มาใช้แทน sessionStorage

// Layouts
import LoginView from "../views/auth/LoginView.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Login",
      component: LoginView, // ย้ายไปโฟลเดอร์ views
      meta: { title: "เข้าสู่ระบบ | Nak Drive" },
    },
  ],
});

// --- Navigation Guard (แบบปรับปรุง) ---
// router.beforeEach(async (to, from, next) => {
//   const authStore = useAuthStore();

//   // ตรวจสอบว่าต้องการ Auth ไหม
//   const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
//   const user = authStore.user; // ดึงจาก Pinia แทน
//   const token = authStore.accessToken;

// //   if (requiresAuth && !token) {
// //     // 1. ถ้าต้องล็อคอิน แต่ไม่มี Token -> ไปหน้า Login
// //     next({ name: "Login" });
// //   } else if (to.name === "Login" && token) {
// //     // 2. ถ้าล็อคอินแล้ว จะเข้าหน้า Login -> ไปหน้า Dashboard ตาม Role
// //     if (authStore.user?.role === "admin") next({ name: "AdminDashboard" });
// //     else next({ name: "UserDashboard" });
// //   } else {
// //     // 3. ตรวจสอบ Role สิทธิ์การเข้าถึง
// //     const requiredRoles = to.meta.roles as string[];
// //     if (requiredRoles && !requiredRoles.includes(authStore.user?.role || "")) {
// //       // ไม่มีสิทธิ์ -> ดีดกลับไปหน้า Dashboard ของตัวเอง
// //       alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
// //       next(from.path);
// //     } else {
// //       next();
// //     }
//   }
// });

// Page Title
router.afterEach((to) => {
  document.title = (to.meta.title as string) || "Nak Drive";
});

export default router;
