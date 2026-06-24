// src/modules/fin/interfaces/dto/transfer.dto.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * TransferDto — DTO de Validación para Transferencias/Pagos
 * ═══════════════════════════════════════════════════════════════
 *
 * DTO que recibe el cuerpo de la solicitud POST /fin/transactions/transfer.
 * Pendiente agregar decoradores de validación (class-validator).
 *
 * Capa: Interfaces (DTO)
 *
 * @module TransferDto
 */

export class TransferDto {
  userId: string;
  amount: number;
  referenceId: string;
}
