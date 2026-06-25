// src/shared/domain/base.entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * BaseEntity — Entidad Base del Dominio
 * ═══════════════════════════════════════════════════════════════
 *
 * Clase abstracta que toda entidad de dominio debe extender.
 * Provee los campos auditables comunes: id (UUID v7 en producción),
 * createdAt y updatedAt.
 *
 * Las entidades de dominio son clases puras de TypeScript (POCO) sin
 * decoradores ni dependencias de infraestructura. La persistencia se
 * maneja mediante ORM entities separadas que mapean a estas.
 *
 * Capa: Dominio (shared)
 *
 * @abstract
 * @module BaseEntity
 */

// ─── Clase abstracta base para todas las entidades de dominio ───
// Define los campos auditables comunes que toda entidad del sistema debe tener:
// id único, timestamp de creación y timestamp de última modificación.
// NO usa decoradores de ORM (TypeORM, etc.) para mantener la capa de dominio pura.
export abstract class BaseEntity {
  id: string; // UUID v7 — identificador único universal generado en el momento de creación de la entidad
  createdAt: Date; // Fecha y hora exacta en que la entidad fue creada (se asigna en el constructor)
  updatedAt: Date; // Fecha y hora de la última modificación de la entidad (inicialmente igual a createdAt)

  constructor(id: string) {
    this.id = id; // El ID se recibe como parámetro (el servicio de aplicación lo genera, ej. uuid v7)
    this.createdAt = new Date(); // Se establece la fecha actual como timestamp de creación
    this.updatedAt = new Date(); // Inicialmente updatedAt = createdAt; se actualizará al persistir cambios
  }
}
