// src/modules/fin/infrastructure/orm/wallet.orm-entity.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * WalletOrmEntity — Entidad TypeORM para tabla fin.wallets
 * ═══════════════════════════════════════════════════════════════
 *
 * Mapeo ORM de la tabla `fin.wallets`. Contraparte de infraestructura
 * de la entidad de dominio Wallet.
 *
 * Notas:
 *   - balance y debtBalance son BIGINT (centavos, no floats)
 *   - version se usa para control de concurrencia optimista (OCC)
 *   - user_id es único (1 wallet por usuario)
 *
 * Esquema: fin
 * Tabla: wallets
 *
 * Capa: Infraestructura (fin/orm)
 *
 * @see Wallet
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'wallets', schema: 'fin' })
export class WalletOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  @Column({ type: 'bigint', default: 0 })
  balance: number;

  @Column({ type: 'bigint', name: 'debt_balance', default: 0 })
  debtBalance: number;

  @Column({ type: 'boolean', name: 'credit_used', default: false })
  creditUsed: boolean;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'timestamptz', name: 'last_transaction_at', nullable: true })
  lastTransactionAt: Date | null;

  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'clock_timestamp()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', default: () => 'clock_timestamp()' })
  updatedAt: Date;
}
