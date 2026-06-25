// src/modules/fin/domain/interfaces/repositories/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports — Puertos de Repositorio del Módulo Financiero
 * ═══════════════════════════════════════════════════════════════
 *
 * Agrupa los puertos de repositorio (WalletRepositoryPort, TransactionRepositoryPort, etc.)
 * y los tokens de inyección de dependencias correspondientes.
 *
 * @module fin/domain/interfaces/repositories
 */

export { WALLET_REPOSITORY_PORT } from './wallet.repository.port';
export type { WalletRepositoryPort } from './wallet.repository.port';
