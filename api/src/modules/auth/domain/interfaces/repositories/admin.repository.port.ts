// auth/domain/interfaces/repositories/admin.repository.port.ts

import { Admin } from '../../entities';

export const ADMIN_REPOSITORY_PORT = 'ADMIN_REPOSITORY_PORT';

export interface AdminRepositoryPort {
  findByPhone(phone: string): Promise<Admin | null>;
  findById(id: string): Promise<Admin | null>;
  save(admin: Admin): Promise<Admin>;
  updateAssociationId(adminId: string, associationId: string): Promise<void>;
  softDelete(passengerId: string): Promise<void>;
  findByEmail(email: string): Promise<Admin | null>;
  findByCedula(cedula: string): Promise<Admin | null>;
  updateLastLogin(userId: string): Promise<void>;
}
