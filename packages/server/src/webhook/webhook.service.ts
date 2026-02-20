import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '../config';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private readonly config: ConfigService) {}

  async deliver(payload: Record<string, any>): Promise<boolean> {
    const url = this.config.get('webhookUrl');
    const timeout = this.config.get('webhookTimeoutMs');

    try {
      await axios.post(url, payload, { timeout });
      this.logger.log(`Webhook delivered to ${url}`);
      return true;
    } catch (err: any) {
      this.logger.warn(`Webhook delivery failed: ${err.message}`);
      return false;
    }
  }

  async sendMoMessage(data: {
    senderPhoneNumber: string;
    messageId: string;
    agentId: string;
    text?: string;
    suggestionResponse?: { postbackData: string; text: string };
    userFile?: { payload: { mimeType: string; fileSizeBytes: number; fileUri: string; fileName: string } };
    location?: { latitude: number; longitude: number };
  }) {
    const payload = {
      senderPhoneNumber: data.senderPhoneNumber,
      messageId: data.messageId,
      sendTime: new Date().toISOString(),
      agentId: data.agentId,
      ...(data.text && { text: data.text }),
      ...(data.suggestionResponse && { suggestionResponse: data.suggestionResponse }),
      ...(data.userFile && { userFile: data.userFile }),
      ...(data.location && { location: data.location }),
    };

    return this.deliver(payload);
  }

  async sendDeliveryReport(data: {
    senderPhoneNumber: string;
    eventType: string;
    eventId: string;
    messageId: string;
  }) {
    const payload = {
      senderPhoneNumber: data.senderPhoneNumber,
      eventType: data.eventType,
      eventId: data.eventId,
      messageId: data.messageId,
      sendTime: new Date().toISOString(),
    };

    return this.deliver(payload);
  }
}
