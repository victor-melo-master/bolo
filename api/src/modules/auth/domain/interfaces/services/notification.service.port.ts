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

// Token de DI para identificar el servicio de notificaciones en el contenedor
export const NOTIFICATION_SERVICE_PORT = 'NOTIFICATION_SERVICE_PORT';

// Puerto para el envío de notificaciones. El dominio depende de esta abstracción, no de implementaciones concretas.
// Los adaptadores pueden usar SendGrid, AWS SES (email) y Twilio, AWS SNS (SMS) sin afectar el dominio.
export interface NotificationServicePort {
  // Envía un correo electrónico al destinatario con asunto y cuerpo.
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  // Envía un mensaje SMS al número telefónico especificado.
  sendSms(phone: string, message: string): Promise<void>;
}
