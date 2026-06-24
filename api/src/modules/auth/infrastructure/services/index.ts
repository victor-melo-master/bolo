// src/modules/auth/infrastructure/services/index.ts — Ruta relativa desde src/
/**
 * Barrel exports para servicios de infraestructura del módulo auth.
 *
 * @module auth/infrastructure/services
 */

// Se re-exporta el servicio de notificaciones para que auth.module.ts
// pueda importarlo desde './services'. Cuando se agreguen más servicios
// de infraestructura (ej. WalletServiceImpl, SmsServiceImpl), se añadirán
// sus exports aquí.
export { NotificationServiceImpl } from './notification.service.impl';
