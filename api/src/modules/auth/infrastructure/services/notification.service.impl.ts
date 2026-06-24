// src/modules/auth/infrastructure/services/notification.service.impl.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * NotificationServiceImpl — Implementación de Notificaciones
 * ═══════════════════════════════════════════════════════════════
 *
 * Adaptador concreto del puerto NotificationServicePort.
 * Actualmente es un stub que solo hace console.log.
 *
 * TODO: Integrar con servicios reales:
 *   - Email: SendGrid, AWS SES, o Nodemailer + SMTP
 *   - SMS: Twilio, AWS SNS, o Mensajería local venezolana
 *   - Push: Firebase Cloud Messaging (FCM)
 *
 * Capa: Infraestructura (auth/services)
 *
 * @module NotificationServiceImpl
 * @see NotificationServicePort
 */

import { Injectable } from '@nestjs/common';
import { NotificationServicePort } from '../../domain/interfaces/services/notification.service.port';

// Injectable: registra la clase en el contenedor DI para ser inyectada
// donde se use el token NOTIFICATION_SERVICE_PORT
@Injectable()
// Implementación stub: todas las notificaciones solo se registran en consola.
// Esta implementación permite avanzar con el desarrollo sin depender de
// servicios externos de notificación. Cada método retorna Promise<void>
// para mantener la misma interfaz que tendrá la implementación real.
export class NotificationServiceImpl implements NotificationServicePort {
  // Envío de email: actualmente solo imprime en consola.
  // En producción: integrar con SendGrid, AWS SES o Nodemailer + SMTP.
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`Sending email to ${to}: ${subject}`);
  }

  // Envío de SMS: actualmente solo imprime en consola.
  // En producción: integrar con Twilio, AWS SNS, o proveedor local.
  async sendSms(to: string, message: string): Promise<void> {
    console.log(`Sending SMS to ${to}: ${message}`);
  }

  // Notificación push: actualmente solo imprime en consola.
  // En producción: integrar con Firebase Cloud Messaging (FCM).
  async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
    console.log(`Sending push to user ${userId}: ${title}`);
  }
}
