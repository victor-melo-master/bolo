// src/modules/auth/domain/interfaces/services/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports — Puertos de Servicios Externos del Módulo Auth
 * ═══════════════════════════════════════════════════════════════
 *
 * Agrupa los puertos de servicios externos (NotificationServicePort,
 * WalletServicePort) que el módulo auth consume vía inyección de
 * dependencias.
 *
 * @module auth/domain/interfaces/services
 */

// Re-exporta todos los puertos de servicios externos para imports centralizados
export * from './notification.service.port';
export * from './wallet.service.port';
