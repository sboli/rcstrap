import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { MessagesModule } from '../messages/messages.module';
import { ConfigModule } from '../config';
import { WebhookModule } from '../webhook/webhook.module';

@Module({
  imports: [MessagesModule, ConfigModule, WebhookModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
