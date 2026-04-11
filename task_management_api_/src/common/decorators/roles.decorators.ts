import { SetMetadata } from '@nestjs/common';
import { Role } from '../enum/role.enum';

export const ROLES_KEY = 'roles';
/**
 *  Decorator สำหรับการจัดการสิทธิ์ในการตรวจสอบที่มีสิทธิ์ใน Role ที่อนุญาติให้เข้าถึงเส้นของ api
 *  หากมีการเข้าถึงสิทธิ์ในการตรวจสอบที่มีสิทธิ์ใน Role ที่อนุญาติให้เข้าถึงเส้นของ api
 * @PARAM ROLES รายการ Role ( admin, hr, employee)
 */

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
