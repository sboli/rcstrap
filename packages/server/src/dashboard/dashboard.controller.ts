import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { MessagesService } from '../messages/messages.service';
import { ConfigService, AppConfig } from '../config';
import { WebhookService } from '../webhook/webhook.service';
import { EventsGateway } from '../gateway/events.gateway';
import { MessageDirection } from '../common/types';

@Controller('api')
export class DashboardController {
  constructor(
    private readonly messages: MessagesService,
    private readonly config: ConfigService,
    private readonly webhook: WebhookService,
    private readonly gateway: EventsGateway,
  ) {}

  @Get('conversations')
  getConversations() {
    return this.messages.getConversations();
  }

  @Get('conversations/:phone/messages')
  getMessages(
    @Param('phone') phone: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.messages.findByPhone(phone, limit ?? 100, offset ?? 0);
  }

  @Get('messages/:id')
  getMessage(@Param('id') id: string) {
    return this.messages.findById(id);
  }

  @Post('compose')
  async compose(
    @Body()
    body: {
      phone: string;
      text?: string;
      suggestionResponse?: { postbackData: string; text: string };
      userFile?: {
        payload: {
          mimeType: string;
          fileSizeBytes: number;
          fileUri: string;
          fileName: string;
        };
      };
      location?: { latitude: number; longitude: number };
    },
  ) {
    const messageId = uuid();
    const agentId = this.config.get('agentId');

    // Store MO message
    const message = this.messages.create({
      messageId,
      phone: body.phone,
      direction: MessageDirection.MO,
      payload: body,
      agentId,
    });

    this.gateway.emitMessageNew(message);

    // Send to agent's webhook
    await this.webhook.sendMoMessage({
      senderPhoneNumber: body.phone,
      messageId,
      agentId,
      text: body.text,
      suggestionResponse: body.suggestionResponse,
      userFile: body.userFile,
      location: body.location,
    });

    return { messageId };
  }

  @Get('config')
  getConfig() {
    return this.config.getAll();
  }

  @Put('config/:key')
  setConfig(
    @Param('key') key: string,
    @Body() body: { value: string },
  ) {
    this.config.set(key as keyof AppConfig, body.value);
    const config = this.config.getAll();
    this.gateway.emitConfigChanged(config);
    return config;
  }

  @Delete('config/:key')
  resetConfig(@Param('key') key: string) {
    this.config.reset(key as keyof AppConfig);
    const config = this.config.getAll();
    this.gateway.emitConfigChanged(config);
    return config;
  }

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
