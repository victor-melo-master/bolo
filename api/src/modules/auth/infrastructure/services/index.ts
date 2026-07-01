// src/modules/auth/infrastructure/services/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports — Servicios de Infraestructura del Módulo Auth
 * ═══════════════════════════════════════════════════════════════
 *
 * Centraliza las exportaciones de los servicios de infraestructura
 * (NotificationServiceImpl, SessionCleanupService) que implementan
 * los puertos definidos en el dominio.
 *
 * @module auth/infrastructure/services
 */

// Se re-exporta el servicio de notificaciones para que auth.module.ts
// pueda importarlo desde './services'. Cuando se agreguen más servicios
// de infraestructura (ej. WalletServiceImpl, SmsServiceImpl), se añadirán
// sus exports aquí.
export { NotificationServiceImpl } from './notification.service.impl';
