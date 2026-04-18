<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const props = defineProps({
  isCollapsed: Boolean,
  isMobileOpen: Boolean,
})

const emit = defineEmits(['closeMobile'])
const router = useRouter()
const showProfileMenu = ref(false)

const userData = ref({
  name: 'Natthavut K.',
  role: 'Administrator',
})

const pendingTasksCount = ref(12)

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

const handleLogout = () => {
  router.push('/login')
}

const closeMobile = () => {
  emit('closeMobile')
}

const handleOutsideClick = (e) => {
  if (!e.target.closest('#profile-btn')) {
    showProfileMenu.value = false
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))

const mainMenus = [
  { to: '/admin/dashboard', icon: 'fa-gauge-high', text: 'Overview' },
  {
    to: '/admin/tasks',
    icon: 'fa-list-check',
    text: 'Task Management',
    badge: true,
  },
]

const systemMenus = [
  { to: '/admin/users', icon: 'fa-user-group', text: 'Team Members' },
  {
    to: '/admin/system/task-settings',
    icon: 'fa-sliders',
    text: 'Task Settings',
  },
  { to: '/admin/system/labels', icon: 'fa-tags', text: 'Labels' },
  { to: '/admin/status-task', icon: ' fa-list-check', text: 'Status Task' },
]

const avatarInitial = computed(() =>
  userData.value.name.charAt(0).toUpperCase(),
)
</script>

<template>
  <!-- Mobile Backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-300"
    leave-to-class="opacity-0"
  >
    <div
      v-if="props.isMobileOpen"
      class="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm md:hidden"
      @click="closeMobile"
    />
  </Transition>

  <!-- Sidebar -->
  <aside
    :class="[
      'flex flex-col h-screen shrink-0 z-40',
      props.isCollapsed ? 'hidden md:flex w-[68px]' : 'hidden md:flex w-60',
      props.isMobileOpen ? '!flex fixed inset-y-0 left-0 w-64' : '',
    ]"
    style="background-color: #ffffff; border-right: 1px solid #e8ecf0"
  >
    <!-- Logo -->
    <div
      :class="[
        'flex items-center shrink-0 h-16 px-4',
        props.isCollapsed ? 'justify-center' : 'gap-3',
      ]"
      style="border-bottom: 1px solid #e8ecf0"
    >
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style="
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          box-shadow: 0 3px 10px rgba(99, 102, 241, 0.25);
        "
      >
        <i class="fa-solid fa-car-side text-sm text-white"></i>
      </div>
      <div v-if="!props.isCollapsed" class="overflow-hidden">
        <p class="text-[14px] font-bold leading-none" style="color: #1a1f2e">
          Nak Drive
        </p>
        <p
          class="text-[10px] tracking-[0.12em] uppercase mt-0.5"
          style="color: #94a3b8"
        >
          Management
        </p>
      </div>
    </div>

    <!-- Nav -->
    <nav
      class="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-5 custom-scrollbar"
    >
      <!-- Main -->
      <div>
        <p
          v-if="!props.isCollapsed"
          class="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.15em]"
          style="color: #94a3b8"
        >
          Main
        </p>
        <div class="space-y-0.5">
          <RouterLink
            v-for="menu in mainMenus"
            :key="menu.to"
            :to="menu.to"
            @click="closeMobile"
            :class="[
              'relative flex items-center gap-3 px-2.5 py-2 rounded-xl',
              'text-[13px] font-medium transition-all duration-150 group',
              props.isCollapsed ? 'justify-center' : '',
            ]"
            style="color: #64748b"
            active-class="nav-active"
          >
            <div
              class="relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors nav-icon-wrap"
            >
              <i :class="['fa-solid', menu.icon, 'text-sm']"></i>
              <span
                v-if="menu.badge && pendingTasksCount > 0"
                class="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
              >
                {{ pendingTasksCount > 9 ? '9+' : pendingTasksCount }}
              </span>
            </div>
            <span v-if="!props.isCollapsed" class="flex-1 truncate">{{
              menu.text
            }}</span>
            <!-- Tooltip -->
            <span
              v-if="props.isCollapsed"
              class="pointer-events-none absolute left-full ml-3 px-3 py-1.5 z-50 rounded-lg text-[12px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center gap-2"
              style="
                background: #1e293b;
                color: #f1f5f9;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
              "
            >
              {{ menu.text }}
            </span>
          </RouterLink>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px mx-1" style="background-color: #e8ecf0"></div>

      <!-- Configuration -->
      <div>
        <p
          v-if="!props.isCollapsed"
          class="px-2 mb-2 text-[10px] font-bold uppercase tracking-[0.15em]"
          style="color: #94a3b8"
        >
          Configuration
        </p>
        <div class="space-y-0.5">
          <RouterLink
            v-for="link in systemMenus"
            :key="link.to"
            :to="link.to"
            @click="closeMobile"
            :class="[
              'relative flex items-center gap-3 px-2.5 py-2 rounded-xl',
              'text-[13px] font-medium transition-all duration-150 group',
              props.isCollapsed ? 'justify-center' : '',
            ]"
            style="color: #64748b"
            active-class="nav-active"
          >
            <div
              class="relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors nav-icon-wrap"
            >
              <i :class="['fa-solid', link.icon, 'text-sm']"></i>
            </div>
            <span v-if="!props.isCollapsed" class="flex-1 truncate">{{
              link.text
            }}</span>
            <span
              v-if="props.isCollapsed"
              class="pointer-events-none absolute left-full ml-3 px-3 py-1.5 z-50 rounded-lg text-[12px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              style="
                background: #1e293b;
                color: #f1f5f9;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
              "
            >
              {{ link.text }}
            </span>
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- Profile -->
    <div class="shrink-0 p-3 relative" style="border-top: 1px solid #e8ecf0">
      <button
        id="profile-btn"
        @click="toggleProfileMenu"
        :class="[
          'w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 group',
          props.isCollapsed ? 'justify-center' : '',
        ]"
        style="hover: background-color: #f8fafc;"
        onmouseenter="this.style.backgroundColor = '#f8fafc'"
        onmouseleave="this.style.backgroundColor = 'transparent'"
      >
        <div class="relative shrink-0">
          <div
            class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white"
            style="background: linear-gradient(135deg, #3b82f6, #8b5cf6)"
          >
            {{ avatarInitial }}
          </div>
          <span
            class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white"
          ></span>
        </div>
        <div v-if="!props.isCollapsed" class="flex-1 text-left overflow-hidden">
          <p
            class="text-[13px] font-semibold truncate leading-tight"
            style="color: #1e293b"
          >
            {{ userData.name }}
          </p>
          <p
            class="text-[10px] uppercase tracking-wider mt-0.5"
            style="color: #94a3b8"
          >
            {{ userData.role }}
          </p>
        </div>
        <i
          v-if="!props.isCollapsed"
          class="fa-solid fa-chevron-up text-[9px] transition-transform duration-300 shrink-0"
          :class="{ 'rotate-180': showProfileMenu }"
          style="color: #cbd5e1"
        ></i>
      </button>

      <!-- Dropdown -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 scale-95 translate-y-2"
        leave-active-class="transition-all duration-150 ease-in"
        leave-to-class="opacity-0 scale-95 translate-y-2"
      >
        <div
          v-if="showProfileMenu"
          :class="[
            'absolute bottom-full mb-2 z-50 rounded-2xl overflow-hidden',
            props.isCollapsed ? 'left-full ml-3 w-52' : 'left-3 right-3',
          ]"
          style="
            background: #ffffff;
            border: 1px solid #e2e8f0;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          "
        >
          <div
            class="px-4 pt-3 pb-2.5"
            style="border-bottom: 1px solid #f1f5f9"
          >
            <p class="text-[13px] font-semibold" style="color: #1e293b">
              {{ userData.name }}
            </p>
            <p class="text-[11px] mt-0.5" style="color: #94a3b8">
              {{ userData.role }}
            </p>
          </div>
          <div class="p-2 space-y-0.5">
            <RouterLink
              to="/admin/profile"
              @click="showProfileMenu = false"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150"
              style="color: #475569"
              onmouseenter="
                this.style.backgroundColor = '#f8fafc'
                this.style.color = '#1e293b'
              "
              onmouseleave="
                this.style.backgroundColor = 'transparent'
                this.style.color = '#475569'
              "
            >
              <i
                class="fa-solid fa-circle-user text-blue-500 w-4 text-center text-sm"
              ></i>
              My Account
            </RouterLink>
            <RouterLink
              to="/admin/settings"
              @click="showProfileMenu = false"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150"
              style="color: #475569"
              onmouseenter="
                this.style.backgroundColor = '#f8fafc'
                this.style.color = '#1e293b'
              "
              onmouseleave="
                this.style.backgroundColor = 'transparent'
                this.style.color = '#475569'
              "
            >
              <i
                class="fa-solid fa-gear text-slate-400 w-4 text-center text-sm"
              ></i>
              Settings
            </RouterLink>
            <div class="h-px my-1" style="background-color: #f1f5f9"></div>
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-left transition-all duration-150"
              style="color: #ef4444"
              onmouseenter="this.style.backgroundColor = '#fef2f2'"
              onmouseleave="this.style.backgroundColor = 'transparent'"
            >
              <i
                class="fa-solid fa-arrow-right-from-bracket w-4 text-center text-sm"
              ></i>
              Sign Out
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </aside>
</template>

<style scoped>
/* Active nav state */
.nav-active {
  color: #3b82f6 !important;
  background-color: #eff6ff !important;
  font-weight: 600;
}
.nav-active .nav-icon-wrap {
  background-color: #dbeafe !important;
}

/* Hover nav state */
.group:not(.nav-active):hover {
  background-color: #f8fafc;
  color: #1e293b !important;
}
.group:not(.nav-active):hover .nav-icon-wrap {
  background-color: #f1f5f9;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 3px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
