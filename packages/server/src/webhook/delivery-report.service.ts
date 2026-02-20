import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { ConfigService } from '../config';
import { WebhookService } from './webhook.service';
import { MessagesService } from '../messages/messages.service';
import { EventsGateway } from '../gateway/events.gateway';
import { MessageStatus } from '../common/types';

@Injectable()
export class DeliveryReportService {
  constructor(
    private readonly config: ConfigService,
    private readonly webhook: WebhookService,
    private readonly messages: MessagesService,
    private readonly gateway: EventsGateway,
  ) {}

  scheduleReports(phone: string, messageId: string) {
    const delay = this.config.get('deliveryReportDelayMs');
    const deliveredPct = this.config.get('deliveryReportDeliveredPct');
    const readPct = this.config.get('deliveryReportReadPct');
    const isTypingEnabled = this.config.get('deliveryReportIsTypingEnabled');

    const shouldDeliver = Math.random() * 100 < deliveredPct;
    if (!shouldDeliver) return;

    // IS_TYPING (optional, before delivered)
    if (isTypingEnabled) {
      setTimeout(() => {
        this.webhook.sendDeliveryReport({
          senderPhoneNumber: phone,
          eventType: 'IS_TYPING',
          eventId: uuid(),
          messageId,
        });
      }, delay / 2);
    }

    // DELIVERED
    setTimeout(() => {
      this.messages.updateStatus(messageId, MessageStatus.DELIVERED);
      this.gateway.emitMessageStatus(messageId, phone, 'DELIVERED');
      this.webhook.sendDeliveryReport({
        senderPhoneNumber: phone,
        eventType: 'DELIVERED',
        eventId: uuid(),
        messageId,
      });

      // READ (only if delivered)
      const shouldRead = Math.random() * 100 < readPct;
      if (shouldRead) {
        setTimeout(() => {
          this.messages.updateStatus(messageId, MessageStatus.READ);
          this.gateway.emitMessageStatus(messageId, phone, 'READ');
          this.webhook.sendDeliveryReport({
            senderPhoneNumber: phone,
            eventType: 'READ',
            eventId: uuid(),
            messageId,
          });
        }, delay);
      }
    }, delay);
  }
}
