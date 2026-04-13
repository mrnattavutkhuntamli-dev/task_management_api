import axios from "axios";
import { useAuthStore } from "@/stores/auth";

// 1. ประกาศ Host ก่อน (สำคัญมาก)
export const BASE_URL_HOST =
  import.meta.env.VITE_API_URL_HOST || "http://localhost:3000";

// 2. ฟังก์ชันต่อ URL สำหรับไฟล์ Upload
export const getUploadUrl = (path: string) => {
  if (!path) return "";
  // ถ้า path เริ่มต้นด้วย / อยู่แล้ว เช่น /avatars/... ให้ต่อ host เข้าไปเลย
  return `${BASE_URL_HOST}/uploads/${path}`;
};

// 3. สร้าง Instance สำหรับ API Calls
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || `${BASE_URL_HOST}/api/v1`,
});

// 4. Interceptors (ฝั่ง Request)
api.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// 5. Interceptors (ฝั่ง Response สำหรับจัดการ Refresh Token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ตรวจสอบ Error 401 และไม่ใช่เส้นทาง Login/Refresh เองเพื่อป้องกัน Loop
    if (error.response?.status === 401 && !originalRequest._retry) {
      const authStore = useAuthStore();
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          },
        );

        authStore.setToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        // ส่ง Request เดิมกลับไปอีกครั้ง
        return api(originalRequest);
      } catch (refreshError) {
        authStore.logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
