// src/modules/ops/infrastructure/orm/route.orm-entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * RouteOrmEntity — Entidad TypeORM para la tabla ops.routes
 * ═══════════════════════════════════════════════════════════════
 *
 * Mapeo objeto-relacional de la tabla `routes` en el esquema `ops`.
 * Cada columna se asigna a una propiedad de la clase con los tipos
 * y restricciones correspondientes (UUIDs, varchar, boolean, timestamps).
 *
 * Sirve como adaptador de persistencia; no contiene lógica de negocio.
 * La entidad de dominio Route es independiente de este mapeo ORM.
 *
 * Capa: Infraestructura (ops)
 *
 * @module RouteOrmEntity
 */

// ─── Importaciones ───

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// ─── Entidad ORM ───

@Entity({ name: 'routes', schema: 'ops' }) // Mapea a la tabla ops.routes en PostgreSQL
export class RouteOrmEntity {
  @PrimaryGeneratedColumn('uuid') // Genera automáticamente un UUID v4 como clave primaria
  id: string;

  @Column({ type: 'uuid', name: 'association_id' }) // FK hacia auth.associations (relación débil, sin constraint)
  associationId: string;

  @Column({ type: 'varchar', length: 255 }) // Nombre corto de la ruta (máx. 255 caracteres)
  name: string;

  @Column({ type: 'text', nullable: true }) // Descripción larga (texto sin límite de tamaño), permite null
  description: string | null;

  @Column({ type: 'uuid', name: 'coop_fare_id' }) // FK hacia fin.coop_fares para calcular tarifas
  coopFareId: string;

  @Column({ type: 'boolean', name: 'is_active', default: true }) // Estado operativo: true = activa, false = desactivada
  isActive: boolean;

  @CreateDateColumn({
    // Se asigna automáticamente al insertar
    type: 'timestamptz', // Timestamp con zona horaria (PostgreSQL)
    name: 'created_at',
    default: () => 'clock_timestamp()', // Usa clock_timestamp() de PG para precisión milisegundo
  })
  createdAt: Date;

  @UpdateDateColumn({
    // Se actualiza automáticamente al modificar
    type: 'timestamptz',
    name: 'updated_at',
    default: () => 'clock_timestamp()',
  })
  updatedAt: Date;
}
