<script setup>
import { ref, onMounted } from "vue";
import TheHeader from "@/components/admin/TheHeader.vue";
import TheSidebar from "@/components/admin/TheSidebar.vue";
import { RouterView } from "vue-router";

const isCollapsed = ref(false);
const isMobileOpen = ref(false);

const toggleMobileSidebar = () => {
  isMobileOpen.value = !isMobileOpen.value;
};

const toggleDesktopSidebar = () => {
  if (typeof window !== "undefined" && window.innerWidth >= 768) {
    isCollapsed.value = !isCollapsed.value;
  } else {
    toggleMobileSidebar();
  }
};

onMounted(() => {
  if (window.innerWidth < 768) {
    isCollapsed.value = true;
  }
});
</script>

<template>
  <div class="h-screen flex overflow-hidden" style="background-color: #f1f5f9">
    <TheSidebar
      :is-collapsed="isCollapsed"
      :is-mobile-open="isMobileOpen"
      @close-mobile="isMobileOpen = false"
    />

    <div class="flex-1 flex flex-col overflow-hidden min-w-0">
      <TheHeader @toggle-sidebar="toggleDesktopSidebar" />

      <main class="flex-1 overflow-auto" style="background-color: #f1f5f9">
        <div class="p-4 sm:p-6">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>
