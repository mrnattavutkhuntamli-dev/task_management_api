/**
 * โครงสร้างข้อมูลมาตรฐานสำหรับการตอบกลับแบบแบ่งหน้า (Pagination)
 * @template T ประเภทของ Entity (เช่น User, Task)
 */
export interface PaginationResult<T> {
  /** รายการข้อมูลในหน้านั้นๆ */
  items: T[];
  /** ข้อมูลสรุปสำหรับการทำ Pagination */
  meta: {
    /** จำนวนรายการทั้งหมดใน Database */
    totalItems: number;
    /** จำนวนรายการที่ส่งกลับไปในรอบนี้ */
    itemCount: number;
    /** จำนวนรายการสูงสุดต่อหน้า */
    itemsPerPage: number;
    /** จำนวนหน้าทั้งหมดที่มี */
    totalPages: number;
    /** เลขหน้าปัจจุบัน */
    currentPage: number;
    /** มีหน้าถัดไปหรือไม่ */
    hasNextPage: boolean;
    /** มีหน้าก่อนหน้าหรือไม่ */
    hasPreviousPage: boolean;
  };
  // (Optional) สำหรับคนที่อยากทำ HATEOAS standard
  links?: {
    first: string;
    previous: string;
    next: string;
    last: string;
  };
}
