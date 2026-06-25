// src/modules/fin/domain/entities/saga-state.entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * SagaState — Entidad de Dominio del Patrón Saga Distribuida
 * ═══════════════════════════════════════════════════════════════
 *
 * Implementa el patrón Saga para transacciones distribuidas.
 * Cada paso (step) de la saga se registra como una entidad independiente
 * con su propio estado, permitiendo compensación en caso de fallo.
 *
 * Flujo típico de un pago:
 *   1. AUTH_HOLD        — Reservar autorización en wallet
 *   2. DEBIT_WALLET     — Debitar saldo de la billetera
 *   3. RECORD_TRANSACTION — Registrar la transacción financiera
 *   4. NOTIFY_USER      — Notificar al usuario
 *   5. RELEASE_HOLD     — Liberar la autorización (compensación)
 *
 * Estados:
 *   PENDING → COMPLETED | FAILED → COMPENSATING → COMPENSATED
 *
 * Capa: Dominio (fin)
 * Método de fábrica:
 *   SagaState.create(sagaId, step, payload?)
 *
 * @module SagaState
 */

export enum SagaStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  COMPENSATING = 'COMPENSATING',
  COMPENSATED = 'COMPENSATED',
}

export enum SagaStep {
  AUTH_HOLD = 'AUTH_HOLD',
  DEBIT_WALLET = 'DEBIT_WALLET',
  RECORD_TRANSACTION = 'RECORD_TRANSACTION',
  NOTIFY_USER = 'NOTIFY_USER',
  RELEASE_HOLD = 'RELEASE_HOLD',
}

export class SagaState {
  constructor(
    // Identificador único UUID de este paso de saga
    public readonly id: string,
    // Identificador único de la saga (agrupa todos los pasos de una transacción)
    public readonly sagaId: string,
    // Nombre del paso dentro del flujo de la saga
    public readonly step: SagaStep,
    // Estado actual del paso
    public readonly status: SagaStatus,
    // Payload opcional con datos del paso (ej: { amount, walletId, transactionId })
    public readonly payload: Record<string, unknown> | null,
    // Mensaje de error si el paso falló
    public readonly error: string | null,
    // Control de concurrencia optimista
    public readonly version: number,
    // Fecha de creación del paso
    public readonly createdAt: Date,
    // Fecha de última modificación
    public readonly updatedAt: Date,
  ) {}

  // Método de fábrica: crea un paso de saga en estado PENDING.
  static create(
    sagaId: string,
    step: SagaStep,
    payload?: Record<string, unknown>,
  ): SagaState {
    return new SagaState(
      crypto.randomUUID(),
      sagaId,
      step,
      SagaStatus.PENDING, // Todo paso nuevo empieza como PENDING
      payload ?? null,
      null, // error: null inicialmente
      1, // version: 1
      new Date(),
      new Date(),
    );
  }

  // Marca el paso como COMPLETED (ejecutado exitosamente).
  complete(): SagaState {
    return new SagaState(
      this.id,
      this.sagaId,
      this.step,
      SagaStatus.COMPLETED,
      this.payload,
      null, // Limpia el error si existía
      this.version + 1,
      this.createdAt,
      new Date(),
    );
  }

  // Marca el paso como FAILED con un mensaje de error.
  fail(error: string): SagaState {
    return new SagaState(
      this.id,
      this.sagaId,
      this.step,
      SagaStatus.FAILED,
      this.payload,
      error,
      this.version + 1,
      this.createdAt,
      new Date(),
    );
  }

  // Inicia la compensación del paso (deshacer la operación).
  compensate(): SagaState {
    return new SagaState(
      this.id,
      this.sagaId,
      this.step,
      SagaStatus.COMPENSATING,
      this.payload,
      null,
      this.version + 1,
      this.createdAt,
      new Date(),
    );
  }

  // Marca la compensación como completada.
  compensated(): SagaState {
    return new SagaState(
      this.id,
      this.sagaId,
      this.step,
      SagaStatus.COMPENSATED,
      this.payload,
      null,
      this.version + 1,
      this.createdAt,
      new Date(),
    );
  }
}
