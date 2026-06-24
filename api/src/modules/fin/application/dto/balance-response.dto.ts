// src/modules/fin/application/dto/balance-response.dto.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * BalanceResponseDto — DTO de Respuesta para Saldo
 * ═══════════════════════════════════════════════════════════════
 *
 * DTO que encapsula la respuesta de consulta de saldo.
 * Retorna balance (disponible), debtBalance (crédito usado)
 * y currency (moneda).
 *
 * Capa: Aplicación (fin)
 *
 * @module BalanceResponseDto
 */

export class BalanceResponseDto {
  balance: number;
  debtBalance: number;
  currency: string;
}
