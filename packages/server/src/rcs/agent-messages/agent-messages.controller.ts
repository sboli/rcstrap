import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  NotFoundException,
} from '@nestjs/common';
import { CreateAgentMessageDto } from './dto/agent-message.dto';
import { AgentMessagesService } from './agent-messages.service';

@Controller('v1/phones/:phone/agentMessages')
export class AgentMessagesController {
  constructor(private readonly service: AgentMessagesService) {}

  @Post()
  create(
    @Param('phone') phone: string,
    @Body() dto: CreateAgentMessageDto,
  ) {
    return this.service.create(phone, dto);
  }

  @Delete(':messageId')
  revoke(
    @Param('phone') phone: string,
    @Param('messageId') messageId: string,
  ) {
    const result = this.service.revoke(phone, messageId);
    if (!result) {
      throw new NotFoundException(`Message ${messageId} not found`);
    }
    return {};
  }
}
