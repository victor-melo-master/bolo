// src/modules/auth/infrastructure/services/notification.service.impl.ts
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

@Injectable()
export class NotificationServiceImpl implements NotificationServicePort {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    console.log(`Sending email to ${to}: ${subject}`);
  }

  async sendSms(to: string, message: string): Promise<void> {
    console.log(`Sending SMS to ${to}: ${message}`);
  }

  async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
    console.log(`Sending push to user ${userId}: ${title}`);
  }
}
