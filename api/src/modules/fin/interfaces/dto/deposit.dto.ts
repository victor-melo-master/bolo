// src/modules/fin/interfaces/dto/deposit.dto.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * DepositDto — DTO de Validación para Depósitos
 * ═══════════════════════════════════════════════════════════════
 *
 * DTO que recibe el cuerpo de la solicitud POST /fin/transactions/deposit.
 * Pendiente agregar decoradores de validación (class-validator).
 *
 * Capa: Interfaces (DTO)
 *
 * @module DepositDto
 */

export class DepositDto {
  userId: string;
  amount: number;
  referenceId?: string;
}
