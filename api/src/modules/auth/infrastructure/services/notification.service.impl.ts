import { Injectable } from '@nestjs/common';
import { INotificationService } from '../../domain/interfaces/services/notification.service.port';

@Injectable()
export class NotificationServiceImpl implements INotificationService {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // TODO: Implement with email service (e.g., SendGrid, AWS SES)
    console.log(`Sending email to ${to}: ${subject}`);
  }

  async sendSMS(to: string, message: string): Promise<void> {
    // TODO: Implement with SMS service (e.g., Twilio)
    console.log(`Sending SMS to ${to}: ${message}`);
  }

  async sendPushNotification(userId: string, title: string, body: string): Promise<void> {
    // TODO: Implement with push notification service (e.g., Firebase)
    console.log(`Sending push to user ${userId}: ${title}`);
  }
}
