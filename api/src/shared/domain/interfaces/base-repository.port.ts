// src/shared/domain/interfaces/base-repository.port.ts — Ruta relativa desde src/
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

// ─── Interfaz genérica de repositorio (Puerto de salida) ───
// Define el contrato CRUD mínimo que toda implementación concreta (TypeORM, mock, etc.) debe satisfacer.
// Sigue el patrón Puerto-Adaptador: el dominio depende de esta abstracción, no de detalles de infraestructura.
export interface IBaseRepository<T> {
  // Busca una entidad por su ID único. Retorna null si no existe (no lanza excepción).
  findById(id: string): Promise<T | null>;

  // Retorna todas las entidades del tipo T. La paginación se agrega en cada módulo si hace falta.
  findAll(): Promise<T[]>;

  // Persiste una nueva entidad y retorna la instancia con valores generados (ID, timestamps, etc.).
  create(entity: T): Promise<T>;

  // Actualiza parcialmente una entidad existente. Lanza NotFoundException si no se encuentra el ID.
  update(id: string, entity: Partial<T>): Promise<T>;

  // Elimina una entidad por su ID. Lanza NotFoundException si no existe.
  delete(id: string): Promise<void>;
}
