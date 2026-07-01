// src/modules/fin/infrastructure/orm/wallet.orm-entity.ts — Ruta relativa desde src/
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
 * @module WalletOrmEntity
 */

// Decoradores de TypeORM para mapeo objeto-relacional
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Define la entidad TypeORM mapeada a la tabla `fin.wallets` en PostgreSQL
@Entity({ name: 'wallets', schema: 'fin' })
export class WalletOrmEntity {
  // Clave primaria UUID generada automáticamente por PostgreSQL (uuid-ossp o pgcrypto)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relación 1:1 con users.user_id. Único para garantizar una wallet por usuario.
  @Column({ type: 'uuid', name: 'user_id', unique: true })
  userId: string;

  // Saldo disponible en centavos. Tipo BIGINT (entero de 64 bits) para operar con valores
  // precisos sin punto flotante. Se almacena como número en TypeScript (cabe en Number.MAX_SAFE_INTEGER).
  @Column({ type: 'bigint', default: 0 })
  balance: number;

  // Deuda acumulada por crédito de emergencia, también en centavos (BIGINT).
  // Refleja saldo negativo temporal que el usuario debe pagar.
  @Column({ type: 'bigint', name: 'debt_balance', default: 0 })
  debtBalance: number;

  // Indica si el usuario ya activó su crédito de emergencia de uso único.
  @Column({ type: 'boolean', name: 'credit_used', default: false })
  creditUsed: boolean;

  // Moneda ISO 4217 de 3 caracteres (USD, VED). Determina la unidad monetaria de esta wallet.
  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Última transacción: timestamp con zona horaria. Nullable porque una wallet nueva nunca transó.
  @Column({ type: 'timestamptz', name: 'last_transaction_at', nullable: true })
  lastTransactionAt: Date | null;

  // Versión para control de concurrencia optimista (OCC). Entero incremental.
  // Cada UPDATE incrementa version y filtra WHERE version = valor_anterior.
  // Si otra sesión modificó el registro concurrentemente, la fila no se encuentra
  // (0 filas afectadas) y la operación se rechaza para evitar escrituras perdidas.
  @Column({ type: 'int', default: 1 })
  version: number;

  // Timestamp de creación con zona horaria. Usa clock_timestamp() de PostgreSQL para
  // obtener hora real (no la del inicio de la transacción) y evitar inconsistencias
  // en operaciones concurrentes dentro de una misma transacción.
  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'clock_timestamp()',
  })
  createdAt: Date;

  // Timestamp de última actualización, también con clock_timestamp().
  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    default: () => 'clock_timestamp()',
  })
  updatedAt: Date;
}
