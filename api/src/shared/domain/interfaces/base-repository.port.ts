// src/shared/domain/interfaces/base-repository.port.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * IBaseRepository — Puerto Genérico de Repositorio
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato mínimo para cualquier repositorio del sistema.
 * Cada módulo puede extender esta interfaz con métodos específicos
 * (findByPhone, findByRif, etc.).
 *
 * Sigue el patrón "Puerto-Adaptador" (Hexagonal): el dominio programa
 * contra esta abstracción, mientras que la infraestructura provee la
 * implementación concreta (TypeORM, mock, etc.).
 *
 * Capa: Dominio (shared) — Puerto de salida
 *
 * @template T Tipo de entidad de dominio
 */

export interface IBaseRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: string, entity: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
