// src/modules/fin/domain/entities/transaction.entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Transaction — Entidad de Dominio de Transacción Financiera
 * ═══════════════════════════════════════════════════════════════
 *
 * Representa una operación financiera sobre una billetera (wallet).
 * Cada transacción es inmutable una vez creada; los cambios de estado
 * producen una nueva instancia (patrón Value Object semantics).
 *
 * Tipos:
 *   - DEPOSIT:    ingreso de fondos a la billetera
 *   - WITHDRAWAL: retiro de fondos desde la billetera
 *   - PAYMENT:    pago por un servicio (viaje, recarga, etc.)
 *   - REFUND:     reverso de un pago o devolución
 *   - FEE:        comisión/cargo por servicio
 *
 * Estados (status):
 *   PENDING → COMPLETED | FAILED → REVERSED
 *
 * Capa: Dominio (fin)
 * Método de fábrica:
 *   Transaction.create(walletId, type, amount, currency, ...)
 *
 * @module Transaction
 */

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  FEE = 'FEE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export class Transaction {
  constructor(
    // Identificador único UUID de la transacción
    public readonly id: string,
    // ID de la billetera sobre la que se opera (relación N:1 con Wallet)
    public readonly walletId: string,
    // Tipo de transacción: DEPOSIT, WITHDRAWAL, PAYMENT, REFUND, FEE
    public readonly type: TransactionType,
    // Monto en centavos (entero, BIGINT en BD). Toda operación usa centavos para evitar errores de redondeo
    public readonly amount: number,
    // Código ISO 4217 de la moneda en que se expresa el monto
    public readonly currency: string,
    // Estado actual de la transacción en su ciclo de vida
    public readonly status: TransactionStatus,
    // ID de referencia externa (ej: ID de viaje, ID de pago gateway). Útil para trazabilidad
    public readonly referenceId: string | null,
    // Descripción textual libre de la transacción
    public readonly description: string | null,
    // Metadatos adicionales en formato JSONB (ej: datos del gateway, desglose de tarifas)
    public readonly metadata: Record<string, unknown> | null,
    // Control de concurrencia optimista (OCC). Se incrementa en cada cambio de estado
    public readonly version: number,
    // Fecha de creación de la transacción. Inmutable.
    public readonly createdAt: Date,
    // Fecha de la última modificación (cambio de estado)
    public readonly updatedAt: Date,
  ) {}

  // Método de fábrica: crea una transacción nueva en estado PENDING.
  static create(
    walletId: string,
    type: TransactionType,
    amount: number,
    currency: string,
    referenceId?: string,
    description?: string,
    metadata?: Record<string, unknown>,
  ): Transaction {
    return new Transaction(
      crypto.randomUUID(), // Genera UUID v4 único
      walletId, // Billetera asociada
      type, // Tipo de operación
      amount, // Monto en centavos
      currency, // Moneda ISO 4217
      TransactionStatus.PENDING, // Toda transacción nueva empieza como PENDING
      referenceId ?? null, // ID de referencia externa opcional
      description ?? null, // Descripción opcional
      metadata ?? null, // Metadatos opcionales
      1, // version: 1 — primera versión
      new Date(), // createdAt: momento de creación
      new Date(), // updatedAt: igual a createdAt inicialmente
    );
  }

  // Marca la transacción como COMPLETED (éxito). Retorna nueva instancia con version+1.
  complete(): Transaction {
    return new Transaction(
      this.id,
      this.walletId,
      this.type,
      this.amount,
      this.currency,
      TransactionStatus.COMPLETED,
      this.referenceId,
      this.description,
      this.metadata,
      this.version + 1,
      this.createdAt,
      new Date(),
    );
  }

  // Marca la transacción como FAILED (error). Retorna nueva instancia con version+1.
  fail(): Transaction {
    return new Transaction(
      this.id,
      this.walletId,
      this.type,
      this.amount,
      this.currency,
      TransactionStatus.FAILED,
      this.referenceId,
      this.description,
      this.metadata,
      this.version + 1,
      this.createdAt,
      new Date(),
    );
  }

  // Revierte la transacción (ej: contracargo). Pasa a estado REVERSED.
  reverse(): Transaction {
    return new Transaction(
      this.id,
      this.walletId,
      this.type,
      this.amount,
      this.currency,
      TransactionStatus.REVERSED,
      this.referenceId,
      this.description,
      this.metadata,
      this.version + 1,
      this.createdAt,
      new Date(),
    );
  }
}
