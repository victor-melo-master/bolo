// src/modules/fin/domain/entities/index.ts — Ruta relativa desde src/
/**
 * Barrel exports para entidades de dominio del módulo fin.
 *
 * @module fin/domain/entities
 */

// Exporta la entidad de dominio Wallet para que esté disponible desde fin/domain/entities
// y a través del barrel público del módulo (fin/index.ts)
export { Wallet } from './wallet.entity';
// (Pendiente) export { Transaction } from './transaction.entity';      — Entidad de transacciones financieras
// (Pendiente) export { CooperativeFare } from './cooperative-fare.entity'; — Tarifas por cooperativa
// (Pendiente) export { PaymentMethod } from './payment-method.entity';  — Métodos de pago asociados a wallet
