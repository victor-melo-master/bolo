// src/modules/fin/infrastructure/orm/coop-fare.orm-entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CoopFareOrmEntity — Entidad TypeORM para tabla fin.coop_fares
 * ═══════════════════════════════════════════════════════════════
 *
 * Mapeo ORM de la tabla `fin.coop_fares`. Contraparte de infraestructura
 * de la entidad de dominio CoopFare.
 *
 * @module CoopFareOrmEntity
 *
 * Campos (coinciden con el DDL):
 *   - association_id (UUID)  → cooperativa propietaria
 *   - name (VARCHAR)         → nombre del tarifario
 *   - base_amount_usd (BIGINT) → precio base en centavos de USD
 *   - exchange_rate_id (UUID)  → tasa de cambio de referencia
 *   - surcharge_normal (BIGINT)   → recargo/descuento normal (centavos)
 *   - surcharge_student (BIGINT)  → recargo/descuento estudiante
 *   - surcharge_elderly (BIGINT)  → recargo/descuento adulto mayor
 *   - is_active (BOOLEAN)         → true si el tarifario está activo
 *   - created_at, updated_at
 *
 * Notas:
 *   - Todos los montos son BIGINT (centavos) para aritmética exacta.
 *   - Solo un tarifario por cooperativa debe tener is_active = true.
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

  // Asociación propietaria del tarifario (referencia a auth.associations)
  @Column({ type: 'uuid', name: 'association_id' })
  associationId: string;

  // Nombre descriptivo del tarifario
  @Column({ type: 'varchar', length: 100 })
  name: string;

  // Tarifa base en centavos de dólar (BIGINT). Ej: 150 = $1.50 USD
  @Column({ type: 'bigint', name: 'base_amount_usd' })
  baseAmountUsd: number;

  // Tasa de cambio de referencia (FK a fin.exchange_rates)
  @Column({ type: 'uuid', name: 'exchange_rate_id' })
  exchangeRateId: string;

  // Recargo/descuento para pasajeros normales (centavos de moneda local)
  @Column({ type: 'bigint', name: 'surcharge_normal', default: 0 })
  surchargeNormal: number;

  // Recargo/descuento para estudiantes
  @Column({ type: 'bigint', name: 'surcharge_student', default: 0 })
  surchargeStudent: number;

  // Recargo/descuento para adultos mayores
  @Column({ type: 'bigint', name: 'surcharge_elderly', default: 0 })
  surchargeElderly: number;

  // Indica si el tarifario está activo. Solo uno por cooperativa debe estar true.
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'clock_timestamp()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    default: () => 'clock_timestamp()',
  })
  updatedAt: Date;
}
