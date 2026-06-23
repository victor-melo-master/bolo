// src/modules/auth/domain/interfaces/services/notification.service.port.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * NotificationServicePort — Puerto de Servicio de Notificaciones
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para el envío de notificaciones a usuarios.
 * Soporta email y SMS. La implementación concreta puede usar
 * SendGrid, AWS SES, Twilio, etc.
 *
 * Capa: Dominio (auth) — Puerto de salida
 *
 * @module NotificationServicePort
 * @see NOTIFICATION_SERVICE_PORT
 */

export const NOTIFICATION_SERVICE_PORT = 'NOTIFICATION_SERVICE_PORT';

export interface NotificationServicePort {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendSms(phone: string, message: string): Promise<void>;
}
