// src/modules/fin/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Fin Module — Barrel Exports
 * ═══════════════════════════════════════════════════════════════
 *
 * Punto de entrada del módulo financiero.
 *
 * Estado actual: implementación completa de:
 *   ✅ Entidades de dominio: Wallet, Transaction, ExchangeRate, CoopFare, SagaState
 *   ✅ Value Objects: Money
 *   ✅ Excepciones de dominio
 *   ✅ Puertos de repositorio y servicio
 *   ✅ Casos de uso: create-wallet, deposit, withdraw, process-payment, get-balance
 *   ✅ DTOs de aplicación
 *   ✅ WalletServiceImpl (implementación real del puerto WalletServicePort)
 *   ✅ ORM entities: todas las entidades TypeORM
 *   ✅ Repositorios TypeORM: todas las implementaciones
 *   ✅ FinModule completo con DI, controladores y exports
 *   ✅ Controladores REST: WalletController, TransactionController
 *   ✅ DTOs de interfaces
 *
 * @module fin/index
 */

export * from './domain';
export * from './application';
export * from './infrastructure';
export * from './interfaces';
