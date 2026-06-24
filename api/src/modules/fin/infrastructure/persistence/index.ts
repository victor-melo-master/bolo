// src/modules/fin/infrastructure/persistence/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports — Implementaciones de Repositorios (Infraestructura)
 * ═══════════════════════════════════════════════════════════════
 *
 * @module fin/infrastructure/persistence
 */

export { WalletRepositoryImpl } from './wallet.repository.impl';
export { TransactionRepositoryImpl } from './transaction.repository.impl';
export { ExchangeRateRepositoryImpl } from './exchange-rate.repository.impl';
export { CoopFareRepositoryImpl } from './coop-fare.repository.impl';
export { SagaStateRepositoryImpl } from './saga-state.repository.impl';
