// src/modules/fin/index.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * Fin Module — Barrel Exports
 * ═══════════════════════════════════════════════════════════════
 *
 * Punto de entrada del módulo financiero.
 *
 * Estado actual: implementación parcial.
 *   ✅ Entidad de dominio Wallet + ORM entity
 *   ❌ WalletServicePort real (actualmente mock en AuthModule)
 *   ❌ Transacciones, tarifas, tipos de cambio
 *   ❌ Saga pattern para pagos distribuidos
 *
 * @module fin/index
 */

export * from './domain/entities';
// export * from './domain/value-objects';
// export * from './domain/exceptions';
// export * from './domain/interfaces';
// export * from './application/use-cases';
// export * from './application/dto';
// export * from './application/services';
// export * from './infrastructure/fin.module';
