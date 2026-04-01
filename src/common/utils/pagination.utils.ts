import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginationResult } from '../interfaces/pagination.interface';

/**
 * ฟังก์ชันช่วยจัดการการแบ่งหน้าข้อมูล (Pagination Utility)
 * * @template T ประเภทของ Entity ที่สอดคล้องกับ ObjectLiteral ของ TypeORM
 * @param queryBuilder Query Builder ที่สร้างเงื่อนไขการดึงข้อมูลไว้แล้ว
 * @param options ออปชันสำหรับการแบ่งหน้า (page, limit)
 * @returns Promise ของข้อมูลที่แบ่งหน้าแล้วพร้อม Metadata
 * * @example
 * const result = await paginate(userQueryBuilder, { page: 1, limit: 10 });
 */

export async function paginate<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  options: { page?: number; limit?: number },
): Promise<PaginationResult<T>> {
  // ตรวจสอบค่า page และ limit ไม่ให้ต่ำกว่า 1
  const page = Number(options.page) || 1;
  const limit = Number(options.limit) || 10;
  // คำนวณจำนวนแถวที่ต้องข้ามไป (Offset)
  const skip = (page - 1) * limit;
  // กำหนดการข้ามและการดึงข้อมูลตามจำนวนที่จำกัด
  queryBuilder.take(limit).skip(skip);
  // ดึงข้อมูลรายการและจำนวนทั้งหมดพร้อมกัน
  const [items, total] = await queryBuilder.getManyAndCount();
  // คำนวณจำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    meta: {
      totalItems: total,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
