// src/modules/fin/infrastructure/orm/saga-state.orm-entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * SagaStateOrmEntity — Entidad TypeORM para tabla fin.saga_states
 * ═══════════════════════════════════════════════════════════════
 *
 * Mapeo ORM de la tabla `fin.saga_states`. Contraparte de infraestructura
 * de la entidad de dominio SagaState.
 *
 * Notas:
 *   - saga_id agrupa todos los pasos de una transacción distribuida
 *   - step identifica el paso dentro del flujo
 *   - status: PENDING → COMPLETED | FAILED → COMPENSATING → COMPENSATED
 *   - payload en JSONB para datos dinámicos del paso
 *   - error almacena mensaje de fallo si ocurre
 *
 * Esquema: fin
 * Tabla: saga_states
 *
 * Capa: Infraestructura (fin/orm)
 *
 * @see SagaState
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum SagaOrmStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
}

export enum SagaOrmStep {
  AUTH_HOLD = 'AUTH_HOLD',
  DEBIT_WALLET = 'DEBIT_WALLET',
  RECORD_TRANSACTION = 'RECORD_TRANSACTION',
  NOTIFY_USER = 'NOTIFY_USER',
  RELEASE_HOLD = 'RELEASE_HOLD',
}

@Entity({ name: 'saga_states', schema: 'fin' })
export class SagaStateOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'saga_id' })
  sagaId: string;

  @Column({ type: 'varchar', length: 30 })
  step: SagaOrmStep;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status: SagaOrmStatus;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  error: string | null;

  @Column({ type: 'int', default: 1 })
  version: number;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at', default: () => 'clock_timestamp()' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at', default: () => 'clock_timestamp()' })
  updatedAt: Date;
}
