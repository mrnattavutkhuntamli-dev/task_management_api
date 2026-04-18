<template>
  <div class="space-y-6 max-w-[1400px] mx-auto p-2 sm:p-0">
    <StatusHeader :total="statusList.length" @add="openModal('create')" />
    <StatusTable
      :items="statusList"
      :loading="isLoading"
      @edit="handleEdit"
      @delete="handleDelete"
    />

    <FormModal
      :show="isModalOpen"
      @close="isModalOpen = false"
      :title="modalMode === 'create' ? 'Add New Status' : 'Edit Status'"
      :is-submitting="isSubmitting"
      @confirm="handleSubmit"
    >
      <div class="space-y-4">
        <div>
          <label class="text-[13px] font-bold text-slate-700"
            >Status Label</label
          >
          <input
            v-model="form.label"
            type="text"
            class="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            placeholder="เช่น รอดำเนินการ"
          />
        </div>

        <div>
          <label class="text-[13px] font-bold text-slate-700"
            >Status Color (Hex)</label
          >
          <div class="flex gap-2 items-center mt-1">
            <input
              v-model="form.color"
              type="color"
              class="w-10 h-10 rounded-lg cursor-pointer border-none"
            />
            <input
              v-model="form.color"
              type="text"
              class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none uppercase"
              placeholder="#000000"
            />
          </div>
        </div>
        <div>
          <label class="text-[13px] font-bold text-slate-700">Order</label>
          <input
            v-model="form.sortOrder"
            type="number"
            class="w-full mt-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            placeholder="เช่น 1 - 99"
          />
        </div>
        <div class="pt-6 flex gap-3">
          <button
            @click="isModalOpen = false"
            class="flex-1 py-4 text-[13px] font-black text-slate-400 hover:bg-slate-50 rounded-2xl"
          >
            Cancel
          </button>
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            class="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[13px] font-black shadow-lg shadow-blue-200 active:scale-95 disabled:opacity-50"
          >
            <span v-if="isSubmitting"
              ><i class="fa-solid fa-circle-notch fa-spin mr-2"></i>
              Processing...</span
            >
            <span v-else>{{
              modalMode === 'create' ? 'Create' : 'Save Changes'
            }}</span>
          </button>
        </div>
      </div>
    </FormModal>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
// Components
import StatusHeader from '@/components/admin/status/statusHeader.vue'
import StatusTable from '@/components/admin/status/statusTable.vue'
import FormModal from '@/components/common/FormModal.vue'
import { useStatusList } from '@/composites/admin/status/statusFetchList'

const { data: statusList, isLoading } = useStatusList('/status-task')

// Modal States
const isModalOpen = ref(false)
const modalMode = ref('create') // 'create' | 'edit'
const isSubmitting = ref(false)
const currentId = ref(null)

const form = reactive({
  label: '',
  key: '',
  color: '#64748b',
  sortOrder: 1,
})

const openModal = (mode, item = null) => {
  /* Logic เปิด Modal เพิ่มข้อมูล */
  modalMode.value = mode
  if (mode === 'edit' && item) {
    // คัดลอกข้อมูลใส่ฟอร์ม
    Object.assign(form, item)
    currentId.value = item.id
  } else {
    // Reset from
    Object.assign(form, {
      label: '',
      key: '',
      color: '#64748b',
      sortOrder: 1,
    })
    currentId.value = null
  }
  isModalOpen.value = true
}
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    console.log('กำลังส่งข้อมูล...', form)
    // ใส่ Logic API ตรงนี้
    isModalOpen.value = false
  } catch (error) {
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}
const handleEdit = (item) => {
  openModal('edit', item)
}
const handleDelete = (item) => {
  console.log('Delete:', item)
}
</script>
