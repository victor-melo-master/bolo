// src/modules/fin/infrastructure/orm/exchange-rate.orm-entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * ExchangeRateOrmEntity — Entidad TypeORM para tabla fin.exchange_rates
 * ═══════════════════════════════════════════════════════════════
 *
 * Mapeo ORM de la tabla `fin.exchange_rates`.
 *
 * Campos:
 *   - currency (VARCHAR)       → código de moneda (ej: 'VES')
 *   - rate (NUMERIC)           → valor de la tasa (ej: 36.50)
 *   - effective_date (DATE)    → fecha de vigencia
 *   - created_at, updated_at
 *
 * Esquema: fin
 * Tabla: exchange_rates
 *
 * Capa: Infraestructura (fin/orm)
 *
 * @see ExchangeRate
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'exchange_rates', schema: 'fin' })
export class ExchangeRateOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Código de moneda ISO 4217 (ej: 'VES', 'COP')
  @Column({ type: 'varchar', length: 10 })
  currency: string;

  // Tasa de cambio (ej: 36.50 significa 1 USD = 36.50 VES)
  @Column({ type: 'numeric', precision: 19, scale: 6 })
  rate: number;

  // Fecha de vigencia de la tasa
  @Column({ type: 'date', name: 'effective_date' })
  effectiveDate: Date;

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
