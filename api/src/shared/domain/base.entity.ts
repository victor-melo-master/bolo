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

export abstract class BaseEntity {
  id: string;            // UUID v7 — identificador único universal, generado en el momento de creación
  createdAt: Date;       // Timestamp de creación (se asigna en el constructor con new Date())
  updatedAt: Date;       // Timestamp de última modificación

  constructor(id: string) {
    // Se asigna el id recibido y se establecen las fechas en el momento de creación
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
