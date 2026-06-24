// src/modules/fin/domain/exceptions/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports — Excepciones de Dominio del Módulo Financiero
 * ═══════════════════════════════════════════════════════════════
 *
 * @module fin/domain/exceptions
 */

export { InsufficientBalanceException } from './insufficient-balance.exception';
export { WalletNotFoundException } from './wallet-not-found.exception';
export { TransactionFailedException } from './transaction-failed.exception';
