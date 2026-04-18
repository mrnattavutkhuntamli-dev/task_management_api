import { ref, reactive, onMounted } from 'vue'
import api from '@/api/axios'

export interface StatusItem {
  id: number
  key: string
  label: string
  color: string
  sortOrder: number
}
export function useStatusList(url: string) {
  const data = ref<StatusItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchItems = async () => {
    isLoading.value = true
    try {
      const response = await api.get(url)
      if (response.data.success) {
        data.value = response.data.data
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch status'
      console.error('Fetch Status Error:', err)
    } finally {
      isLoading.value = false
    }
  }
  onMounted(() => {
    fetchItems()
  })
  return { data, isLoading, fetchItems }
}
