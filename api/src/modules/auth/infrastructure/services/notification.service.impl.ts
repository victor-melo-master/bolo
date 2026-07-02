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
import { Logger } from '@nestjs/common';

// Injectable: registra la clase en el contenedor DI para ser inyectada
// donde se use el token NOTIFICATION_SERVICE_PORT
@Injectable()
// Implementación stub: todas las notificaciones solo se registran en consola.
// Esta implementación permite avanzar con el desarrollo sin depender de
// servicios externos de notificación. Cada método retorna Promise<void>
// para mantener la misma interfaz que tendrá la implementación real.
export class NotificationServiceImpl implements NotificationServicePort {
  private readonly logger = new Logger(NotificationServiceImpl.name);

  // Envío de email: actualmente solo imprime en consola.
  // En producción: integrar con SendGrid, AWS SES o Nodemailer + SMTP.
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    this.logger.log(`Sending email to ${to}: ${subject}`);
  }

  // Envío de SMS: actualmente solo imprime en consola.
  // En producción: integrar con Twilio, AWS SNS, o proveedor local.
  async sendSms(to: string, message: string): Promise<void> {
    this.logger.log(`Sending SMS to ${to}: ${message}`);
  }

  // Notificación push: actualmente solo imprime en consola.
  // En producción: integrar con Firebase Cloud Messaging (FCM).
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
  ): Promise<void> {
    this.logger.log(`Sending push to user ${userId}: ${title}`);
  }

  async sendRecoveryEmail(email: string, token: string): Promise<void> {
    // En el MVP se loguea el enlace; luego se integrará con servicio real de email.
    const recoveryLink = `https://tu-app.com/recover?token=${token}`;
    this.logger.log(
      `[Recovery] Enlace de recuperación para ${email}: ${recoveryLink}`,
    );
  }

  async sendRecoveryCode(email: string, code: string): Promise<void> {
    this.logger.log(`[Recovery] Código para ${email}: ${code}`);
  }
}
