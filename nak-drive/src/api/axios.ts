import axios from "axios";
import { useAuthStore } from "@/stores/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
});

// ดักตอนส่ง: ย้าย useAuthStore มาไว้ข้างในนี้
api.interceptors.request.use((config) => {
  const authStore = useAuthStore(); // 👈 ย้ายมาเรียกตรงนี้
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// ดักตอนตอบ: ย้าย useAuthStore มาไว้ข้างในนี้เช่นกัน
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const authStore = useAuthStore(); // 👈 ย้ายมาเรียกตรงนี้
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("refresh_token")}`,
            },
          },
        );

        authStore.setToken(data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
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
