import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { CreateAgentMessageDto } from './dto/agent-message.dto';
import { MessagesService } from '../../messages/messages.service';
import { ConfigService } from '../../config';
import { EventsGateway } from '../../gateway/events.gateway';
import { DeliveryReportService } from '../../webhook/delivery-report.service';
import { MessageDirection, MessageStatus } from '../../common/types';
import { IsE164PhoneConstraint } from '../validation/rcs-validators';

const phoneValidator = new IsE164PhoneConstraint();

@Injectable()
export class AgentMessagesService {
  constructor(
    private readonly messages: MessagesService,
    private readonly config: ConfigService,
    private readonly gateway: EventsGateway,
    private readonly deliveryReports: DeliveryReportService,
  ) {}

  create(phone: string, dto: CreateAgentMessageDto) {
    if (!phoneValidator.validate(phone)) {
      throw new BadRequestException('Phone number must be in E.164 format');
    }

    const messageId = dto.messageId ?? uuid();
    const agentId = this.config.get('agentId');

    const message = this.messages.create({
      messageId,
      phone,
      direction: MessageDirection.MT,
      payload: dto as any,
      agentId,
    });

    this.gateway.emitMessageNew(message);
    this.deliveryReports.scheduleReports(phone, messageId);

    return { name: `phones/${phone}/agentMessages/${messageId}` };
  }

  revoke(phone: string, messageId: string) {
    const msg = this.messages.findByMessageId(messageId);
    if (!msg || msg.phone !== phone) return null;
    if (msg.status === MessageStatus.DELIVERED || msg.status === MessageStatus.READ) {
      throw new BadRequestException('Cannot revoke already-delivered message');
    }

    this.messages.updateStatus(messageId, MessageStatus.REVOKED);
    this.gateway.emitMessageRevoked(messageId, phone);
    return true;
  }
}
