import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("access_token") || null);
  const user = ref(JSON.parse(localStorage.getItem("user_payload") || "null"));

  const setToken = (newToken: string) => {
    token.value = newToken;
    localStorage.setItem("access_token", newToken);
  };

  const setUser = (payload: any) => {
    user.value = payload;
    localStorage.setItem("user_payload", JSON.stringify(payload));
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_payload");
  };

  return { token, user, setToken, setUser, logout };
});
