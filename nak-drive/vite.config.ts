import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
   plugins: [vue(), vueDevTools(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 800, // ขยับเพดานเป็น 800kB เพราะ ApexCharts ยังไงก็ใหญ่
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // แยก ApexCharts ออกจากเพื่อน
            if (id.includes("apexcharts")) {
              return "vendor-apexcharts";
            }
            // แยก Vue core ออกมา (ช่วยเรื่อง Caching)
            if (id.includes("vue")) {
              return "vendor-vue";
            }
            // ที่เหลือรวมใน vendor ทั่วไป
            return "vendor";
          }
        },
      },
    },
  },
});
