<script setup lang="ts">
defineProps<{
  show: boolean;
  title: string;
}>();

const emit = defineEmits(["close"]);
</script>

<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div
        @click="emit('close')"
        class="absolute inset-0 bg-slate-900/40 backdrop-blur-[4px]"
      ></div>

      <div
        class="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl shadow-slate-200/50 overflow-hidden animate-slide-up"
      >
        <div
          class="px-8 py-6 border-b border-slate-50 flex items-center justify-between"
        >
          <h3 class="text-xl font-black text-slate-800 tracking-tight">
            {{ title }}
          </h3>
          <button
            @click="emit('close')"
            class="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-colors"
          >
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <div class="p-8">
          <slot></slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-slide-up {
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
