import { Controller, Post, Param, Body } from '@nestjs/common';
import { CreateAgentEventDto } from './dto/agent-event.dto';
import { EventsGateway } from '../../gateway/events.gateway';

@Controller('v1/phones/:phone/agentEvents')
export class AgentEventsController {
  constructor(private readonly gateway: EventsGateway) {}

  @Post()
  create(
    @Param('phone') phone: string,
    @Body() dto: CreateAgentEventDto,
  ) {
    this.gateway.emitAgentEvent(phone, dto);
    return {};
  }
}
