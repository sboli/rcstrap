import { IsString, IsEnum, IsOptional } from 'class-validator';

export enum AgentEventType {
  IS_TYPING = 'IS_TYPING',
  READ = 'READ',
}

export class CreateAgentEventDto {
  @IsEnum(AgentEventType)
  eventType: AgentEventType;

  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsString()
  eventId?: string;
}
