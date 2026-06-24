// src/modules/fin/infrastructure/orm/index.ts — Ruta relativa desde src/
/**
 * Barrel exports para entidades ORM del módulo fin.
 *
 * @module fin/infrastructure/orm
 */

// Exporta las entidades TypeORM del módulo financiero para que el módulo NestJS
// las registre en TypeOrmModule.forFeature([...]) y estén disponibles en los repositorios
export { WalletOrmEntity } from './wallet.orm-entity';
// (Pendiente) export { TransactionOrmEntity } from './transaction.orm-entity';
// (Pendiente) export { CooperativeFareOrmEntity } from './cooperative-fare.orm-entity';
// (Pendiente) export { PaymentMethodOrmEntity } from './payment-method.orm-entity';
