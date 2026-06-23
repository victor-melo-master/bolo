import { Injectable } from '@nestjs/common';
import { NotificationServicePort } from '../../domain/interfaces/services/notification.service.port';
@Injectable()
export class NotificationServiceImpl implements NotificationServicePort {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // TODO: Implement with email service (e.g., SendGrid, AWS SES)
    console.log(`Sending email to ${to}: ${subject}`);
  }

  async sendSms(to: string, message: string): Promise<void> {
    // TODO: Implement with SMS service (e.g., Twilio)
    console.log(`Sending SMS to ${to}: ${message}`);
  }

  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
  ): Promise<void> {
    // TODO: Implement with push notification service (e.g., Firebase)
    console.log(`Sending push to user ${userId}: ${title}`);
  }
}
