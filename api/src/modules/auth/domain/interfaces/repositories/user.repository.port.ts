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

// Se importa la entidad User para tipar los retornos del repositorio
import { User } from '../../entities';

// Token único para que el contenedor DI (NestJS) asocie esta interfaz con su implementación concreta.
// Se usa un string en vez de una clase para evitar conflictos con múltiples implementaciones del mismo puerto.
export const USER_REPOSITORY_PORT = 'USER_REPOSITORY_PORT';

// Puerto (contrato) del repositorio de usuarios. Define qué operaciones de persistencia necesita la capa de dominio.
// La implementación concreta (adaptador) vive en infraestructura (TypeORM, mock, etc.).
export interface UserRepositoryPort {
  // Busca un usuario por su UUID. Retorna null si no existe.
  findById(id: string): Promise<User | null>;
  // Busca un usuario por su número telefónico (campo único en el dominio).
  findByPhone(phone: string): Promise<User | null>;
  // Persiste un usuario: hace insert si es nuevo, update si ya existe (upsert).
  save(user: User): Promise<User>;
  // Actualiza únicamente el campo jwtKey del usuario, usado para invalidar tokens JWT al cambiar contraseña.
  updateJwtKey(userId: string, jwtKey: string): Promise<void>;
  // Actualiza el campo associationId del usuario, usado para asociar un usuario a una asociación.
  updateAssociationId(userId: string, associationId: string): Promise<void>;
}
