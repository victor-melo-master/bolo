// auth/domain/interfaces/repositories/admin.repository.port.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * AdminRepositoryPort — Puerto de Repositorio de Administradores
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para operaciones de persistencia de la entidad
 * Admin. Sigue el patrón Puerto-Adaptador (Hexagonal): el dominio
 * programa contra esta abstracción, la infraestructura provee la
 * implementación concreta.
 *
 * Capa: Dominio (auth) — Puerto de salida
 *
 * @module AdminRepositoryPort
 */

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
