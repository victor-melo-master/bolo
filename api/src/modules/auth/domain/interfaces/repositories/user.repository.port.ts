// src/modules/auth/domain/interfaces/repositories/user.repository.port.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * UserRepositoryPort — Puerto de Repositorio de Usuarios
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato que debe cumplir cualquier implementación del
 * repositorio de usuarios (TypeORM, mock, etc.).
 *
 * Métodos:
 *   - findById(id):       busca por UUID
 *   - findByPhone(phone): busca por número telefónico (único)
 *   - save(user):         persiste (insert o update según existencia)
 *
 * Capa: Dominio (auth) — Puerto de salida
 *
 * @module UserRepositoryPort
 * @see USER_REPOSITORY_PORT
 */

import { User } from '../../entities';

export const USER_REPOSITORY_PORT = 'USER_REPOSITORY_PORT';

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  save(user: User): Promise<User>;
  updateJwtKey(userId: string, jwtKey: string): Promise<void>;
}
