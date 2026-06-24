// src/modules/fin/application/dto/transaction.dto.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * TransactionDto — DTO de Respuesta para Transacciones
 * ═══════════════════════════════════════════════════════════════
 *
 * DTO de aplicación que expone los datos de una transacción
 * hacia la capa de interfaces (controladores REST).
 *
 * Capa: Aplicación (fin)
 *
 * @module TransactionDto
 */

export enum TransactionTypeDto {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  FEE = 'FEE',
}

export enum TransactionStatusDto {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REVERSED = 'REVERSED',
}

export class TransactionDto {
  id: string;
  walletId: string;
  type: TransactionTypeDto;
  amount: number;
  currency: string;
  status: TransactionStatusDto;
  referenceId: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}
