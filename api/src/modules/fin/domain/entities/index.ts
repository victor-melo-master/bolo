// src/modules/fin/domain/entities/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports — Entidades de Dominio del Módulo Financiero
 * ═══════════════════════════════════════════════════════════════
 *
 * Exporta todas las entidades puras del módulo fin para que estén
 * disponibles desde fin/domain/entities y a través del barrel público.
 *
 * @module fin/domain/entities
 */

export { Wallet } from './wallet.entity';
export {
  Transaction,
  TransactionType,
  TransactionStatus,
} from './transaction.entity';
export { ExchangeRate } from './exchange-rate.entity';
export { CoopFare } from './coop-fare.entity';
export { SagaState, SagaStatus, SagaStep } from './saga-state.entity';
