// src/modules/fin/infrastructure/orm/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports — Entidades ORM del Módulo Financiero
 * ═══════════════════════════════════════════════════════════════
 *
 * Exporta las entidades de TypeORM para que FinModule las registre
 * via TypeOrmModule.forFeature([...]).
 *
 * @module fin/infrastructure/orm
 */

export { WalletOrmEntity } from './wallet.orm-entity';
export { TransactionOrmEntity, TransactionOrmType, TransactionOrmStatus } from './transaction.orm-entity';
export { ExchangeRateOrmEntity } from './exchange-rate.orm-entity';
export { CoopFareOrmEntity } from './coop-fare.orm-entity';
export { SagaStateOrmEntity, SagaOrmStatus, SagaOrmStep } from './saga-state.orm-entity';
