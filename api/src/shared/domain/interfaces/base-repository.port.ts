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

// ─── Interfaz genérica de repositorio (Puerto de salida — Patrón Hexagonal) ───
// Define el contrato CRUD mínimo que toda implementación concreta debe satisfacer.
// Sigue el patrón Puerto-Adaptador (Arquitectura Hexagonal): la capa de dominio depende de
// esta abstracción (puerto de salida), no de los detalles de infraestructura como TypeORM,
// MongoDB, o mocks de testing. Cada módulo de dominio puede extender esta interfaz con
// métodos específicos de negocio (findByEmail, findActiveByUserId, etc.).
export interface IBaseRepository<T> {
  // Busca una entidad por su ID único (UUID v7). Retorna null si no existe,
  // NO lanza excepción — el caso de uso decide cómo manejar la ausencia (ej. NotFoundException).
  findById(id: string): Promise<T | null>;

  // Retorna todas las entidades del tipo T. Sin paginación por defecto;
  // cada módulo agrega paginación si la necesita (findAllPaginated, etc.).
  findAll(): Promise<T[]>;

  // Persiste una nueva entidad en el almacenamiento. Retorna la entidad completa
  // con los valores generados por la base de datos (ID auto-generado, timestamps, defaults).
  create(entity: T): Promise<T>;

  // Actualiza parcialmente una entidad existente (solo los campos incluidos en Partial<T>).
  // Lanza NotFoundException si no existe una entidad con el ID especificado.
  update(id: string, entity: Partial<T>): Promise<T>;

  // Elimina una entidad por su ID. Lanza NotFoundException si no existe.
  // No retorna la entidad eliminada — solo confirma la operación.
  delete(id: string): Promise<void>;
}
