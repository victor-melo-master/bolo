// src/modules/fin/infrastructure/orm/coop-fare.orm-entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CoopFareOrmEntity — Entidad TypeORM para tabla fin.coop_fares
 * ═══════════════════════════════════════════════════════════════
 *
 * Mapeo ORM de la tabla `fin.coop_fares`. Contraparte de infraestructura
 * de la entidad de dominio CoopFare.
 *
 * Notas:
 *   - base_fare y per_km_rate son BIGINT (centavos, no floats)
 *   - cooperative_id referencia a auth.associations.id
 *   - active: solo una tarifa activa por cooperativa
 *
 * Esquema: fin
 * Tabla: coop_fares
 *
 * Capa: Infraestructura (fin/orm)
 *
 * @see CoopFare
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'coop_fares', schema: 'fin' })
export class CoopFareOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'cooperative_id' })
  cooperativeId: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'bigint', name: 'base_fare' })
  baseFare: number;

  @Column({ type: 'bigint', name: 'per_km_rate' })
  perKmRate: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'clock_timestamp()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', default: () => 'clock_timestamp()' })
  updatedAt: Date;
}
