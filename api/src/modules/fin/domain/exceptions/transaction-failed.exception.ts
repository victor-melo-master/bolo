// src/modules/fin/domain/exceptions/transaction-failed.exception.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * TransactionFailedException — Transacción Fallida
 * ═══════════════════════════════════════════════════════════════
 *
 * Se lanza cuando una operación financiera no puede completarse
 * por razones distintas a saldo insuficiente (ej: error de BD,
 * conflicto de concurrencia, validación de negocio).
 *
 * Capa: Dominio (fin)
 *
 * @module TransactionFailedException
 */

export class TransactionFailedException extends Error {
  public readonly transactionId: string | null;
  public readonly reason: string;

  constructor(reason: string, transactionId?: string) {
    super(`Transaction failed: ${reason}${transactionId ? ` (id: ${transactionId})` : ''}`);
    this.name = 'TransactionFailedException';
    this.transactionId = transactionId ?? null;
    this.reason = reason;
  }
}
