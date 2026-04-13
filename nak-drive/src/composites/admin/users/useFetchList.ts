import { ref, reactive } from "vue";
import api from "@/api/axios";

// 1. เปลี่ยนจาก export default เป็น export function
export function useFetchList(url: string) {
  const data = ref([]);
  const isLoading = ref(false);

  const pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // 2. ใช้ชื่อ fetchItems ให้ตรงกับที่หน้า View เรียก (หรือจะใช้ fetchData ก็ได้แต่ต้องตรงกัน)
  const fetchData = async (params: any) => {
    isLoading.value = true;
    try {
      const response = await api.get(url, { params });
      if (response.data.success) {
        data.value = response.data.data;
        Object.assign(pagination, response.data.meta);
      }
    } finally {
      isLoading.value = false;
    }
  };

  return { data, isLoading, pagination, fetchItems: fetchData };
}
