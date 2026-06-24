// src/modules/fin/infrastructure/orm/transaction.orm-entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * TransactionOrmEntity — Entidad TypeORM para tabla fin.transactions
 * ═══════════════════════════════════════════════════════════════
 *
 * Mapeo ORM de la tabla `fin.transactions`. Contraparte de infraestructura
 * de la entidad de dominio Transaction.
 *
 * Notas:
 *   - amount es BIGINT (centavos, no floats)
 *   - type se almacena como VARCHAR (no enum nativo de PG para flexibilidad)
 *   - status: PENDING → COMPLETED | FAILED → REVERSED
 *   - metadata en JSONB para datos dinámicos
 *
 * Esquema: fin
 * Tabla: transactions
 *
 * Capa: Infraestructura (fin/orm)
 *
 * @see Transaction
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TransactionOrmType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  FEE = 'FEE',
}

export enum TransactionOrmStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

@Entity({ name: 'transactions', schema: 'fin' })
export class TransactionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'wallet_id' })
  walletId: string;

  @Column({ type: 'varchar', length: 20 })
  type: TransactionOrmType;

  @Column({ type: 'bigint' })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: TransactionOrmStatus;

  @Column({ type: 'uuid', name: 'reference_id', nullable: true })
  referenceId: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'clock_timestamp()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', default: () => 'clock_timestamp()' })
  updatedAt: Date;
}
