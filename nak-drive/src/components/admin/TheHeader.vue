<script setup>
import { computed } from "vue";
import { useRoute, RouterLink } from "vue-router";

const emit = defineEmits(["toggleSidebar"]);
const route = useRoute();

const breadcrumbItems = computed(() => {
  const items = route.meta.breadcrumb || [];
  return items.map((item, index) => ({
    text: item.text,
    to: item.to,
    isLink: index < items.length - 1,
  }));
});
</script>

<template>
  <header
    class="h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20"
    style="background-color: #ffffff; border-bottom: 1px solid #e8ecf0"
  >
    <div class="flex items-center gap-3">
      <!-- Toggle Button -->
      <button
        @click="emit('toggleSidebar')"
        class="group w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none active:scale-95"
        style="color: #94a3b8"
        onmouseenter="
          this.style.backgroundColor = '#f1f5f9';
          this.style.color = '#475569';
        "
        onmouseleave="
          this.style.backgroundColor = 'transparent';
          this.style.color = '#94a3b8';
        "
      >
        <i class="fa-solid fa-bars text-sm"></i>
      </button>

      <!-- Divider -->
      <div class="w-px h-5" style="background-color: #e2e8f0"></div>

      <!-- Breadcrumb -->
      <nav class="flex items-center gap-1.5" aria-label="Breadcrumb">
        <template v-for="(item, index) in breadcrumbItems" :key="index">
          <RouterLink
            v-if="item.isLink"
            :to="item.to"
            class="px-2 py-1 rounded-lg text-[13px] font-medium transition-all duration-150"
            style="color: #94a3b8"
            onmouseenter="
              this.style.color = '#475569';
              this.style.backgroundColor = '#f8fafc';
            "
            onmouseleave="
              this.style.color = '#94a3b8';
              this.style.backgroundColor = 'transparent';
            "
          >
            {{ item.text }}
          </RouterLink>

          <span v-else class="text-[13px] font-semibold" style="color: #1e293b">
            {{ item.text }}
          </span>

          <i
            v-if="index < breadcrumbItems.length - 1"
            class="fa-solid fa-chevron-right text-[9px]"
            style="color: #cbd5e1"
          ></i>
        </template>

        <!-- Fallback -->
        <div
          v-if="breadcrumbItems.length === 0"
          class="flex items-center gap-2"
        >
          <i class="fa-solid fa-house text-[11px]" style="color: #94a3b8"></i>
          <span class="text-[13px] font-semibold" style="color: #1e293b"
            >Dashboard</span
          >
        </div>
      </nav>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-1">
      <!-- Notification -->
      <button
        class="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none"
        style="color: #94a3b8"
        onmouseenter="
          this.style.backgroundColor = '#f1f5f9';
          this.style.color = '#475569';
        "
        onmouseleave="
          this.style.backgroundColor = 'transparent';
          this.style.color = '#94a3b8';
        "
      >
        <i class="fa-solid fa-bell text-sm"></i>
        <span
          class="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500"
        ></span>
      </button>

      <!-- Search -->
      <button
        class="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none"
        style="color: #94a3b8"
        onmouseenter="
          this.style.backgroundColor = '#f1f5f9';
          this.style.color = '#475569';
        "
        onmouseleave="
          this.style.backgroundColor = 'transparent';
          this.style.color = '#94a3b8';
        "
      >
        <i class="fa-solid fa-magnifying-glass text-sm"></i>
      </button>
    </div>
  </header>
</template>
