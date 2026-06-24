// src/modules/fin/domain/exceptions/wallet-not-found.exception.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * WalletNotFoundException — Billetera No Encontrada
 * ═══════════════════════════════════════════════════════════════
 *
 * Se lanza cuando se intenta operar sobre una billetera que no existe
 * (userId no registrado o ID inválido).
 *
 * Capa: Dominio (fin)
 *
 * @module WalletNotFoundException
 */

export class WalletNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Wallet not found: ${identifier}`);
    this.name = 'WalletNotFoundException';
  }
}
