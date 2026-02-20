import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { AgentMessagesController } from './agent-messages/agent-messages.controller';
import { AgentMessagesService } from './agent-messages/agent-messages.service';
import { NormalizeRbmMiddleware } from './agent-messages/normalize-rbm.middleware';
import { AgentEventsController } from './agent-events/agent-events.controller';
import { FilesController } from './files/files.controller';
import { CapabilitiesController } from './capabilities/capabilities.controller';
import { TestersController } from './testers/testers.controller';
import { UsersController } from './users/users.controller';
import { MessagesModule } from '../messages/messages.module';
import { ConfigModule } from '../config';
import { GatewayModule } from '../gateway/gateway.module';
import { WebhookModule } from '../webhook/webhook.module';

@Module({
  imports: [MessagesModule, ConfigModule, GatewayModule, WebhookModule],
  controllers: [
    AgentMessagesController,
    AgentEventsController,
    FilesController,
    CapabilitiesController,
    TestersController,
    UsersController,
  ],
  providers: [AgentMessagesService],
})
export class RcsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(NormalizeRbmMiddleware)
      .forRoutes(AgentMessagesController);
  }
}
