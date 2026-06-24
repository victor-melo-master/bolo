// src/modules/fin/index.ts — Ruta relativa desde src/
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

// Exporta las entidades de dominio públicas del módulo financiero (Wallet actualmente)
export * from './domain/entities';
// (Pendiente) Value Objects: Moneda, Monto, PorcentajeTarifa — tipado fuerte para valores financieros
// export * from './domain/value-objects';
// (Pendiente) Excepciones de dominio: SaldoInsuficienteError, LimiteCreditoAlcanzadoError, etc.
// export * from './domain/exceptions';
// (Pendiente) Interfaces de repositorio y puertos: WalletRepositoryPort, PaymentGatewayPort
// export * from './domain/interfaces';
// (Pendiente) Casos de uso: RecargarSaldo, Transferir, PagarViaje, ActivarCreditoEmergencia
// export * from './application/use-cases';
// (Pendiente) DTOs de aplicación: RecargaRequest, TransferenciaResponse, EstadoCuentaDTO
// export * from './application/dto';
// (Pendiente) Servicios de aplicación: WalletService, PaymentOrchestrator, FeeCalculator
// export * from './application/services';
// (Pendiente) Módulo NestJS raíz: FinModule con imports reales de TypeORM, controladores y servicios
// export * from './infrastructure/fin.module';
