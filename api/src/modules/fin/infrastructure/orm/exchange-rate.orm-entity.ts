// src/modules/fin/infrastructure/orm/exchange-rate.orm-entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * ExchangeRateOrmEntity — Entidad TypeORM para tabla fin.exchange_rates
 * ═══════════════════════════════════════════════════════════════
 *
 * Mapeo ORM de la tabla `fin.exchange_rates`. Contraparte de infraestructura
 * de la entidad de dominio ExchangeRate.
 *
 * Notas:
 *   - rate es DECIMAL(18,8) para precisión financiera en tasas
 *   - valid_from / valid_until definen la vigencia temporal
 *   - valid_until NULL = vigente indefinidamente
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

  @Column({ type: 'varchar', length: 3, name: 'from_currency' })
  fromCurrency: string;

  @Column({ type: 'varchar', length: 3, name: 'to_currency' })
  toCurrency: string;

  @Column({ type: 'decimal', precision: 18, scale: 8 })
  rate: number;

  @Column({ type: 'timestamptz', name: 'valid_from' })
  validFrom: Date;

  @Column({ type: 'timestamptz', name: 'valid_until', nullable: true })
  validUntil: Date | null;

  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'clock_timestamp()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', default: () => 'clock_timestamp()' })
  updatedAt: Date;
}
