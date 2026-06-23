// src/shared/domain/base.entity.ts
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
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string) {
    this.id = id;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}
