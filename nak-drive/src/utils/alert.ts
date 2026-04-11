// src/utils/alert.ts
import Swal from "sweetalert2";

export const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "#1e293b", // สี Slate-800 ให้เข้ากับ Dark Mode
  color: "#f8fafc",
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export const alertSuccess = (title: string, text?: string) => {
  return Swal.fire({
    icon: "success",
    title: title,
    text: text,
    background: "#0a0a0a", // สีพื้นหลังที่เราเลือก
    color: "#fff",
    confirmButtonColor: "#2563eb", // สีน้ำเงิน Blue-600
    // borderRadius: "1.5rem", // Luxury Rounded
    customClass: {
      popup: "rounded-3xl border border-white/10 backdrop-blur-xl",
      title: "text-2xl font-bold",
      confirmButton: "px-8 py-3 rounded-2xl font-bold",
    },
  });
};

export const alertError = (title: string, text?: string) => {
  return Swal.fire({
    icon: "error",
    title: title,
    text: text,
    background: "#0a0a0a",
    color: "#fff",
    confirmButtonColor: "#ef4444",
    customClass: {
      popup: "rounded-3xl border border-white/10",
      confirmButton: "px-8 py-3 rounded-2xl font-bold",
    },
  });
};
