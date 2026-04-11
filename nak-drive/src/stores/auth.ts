import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const accessToken = ref(localStorage.getItem("access_token"));

  const setToken = (token: string) => {
    accessToken.value = token;
    localStorage.setItem("access_token", token);
  };

  const logout = () => {
    user.value = null;
    accessToken.value = null;
    localStorage.clear(); // ล้างข้อมูลทั้งหมด
    window.location.href = "/login";
  };

  return { user, accessToken, setToken, logout };
});
