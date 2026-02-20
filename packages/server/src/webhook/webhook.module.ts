import { Module, forwardRef } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { DeliveryReportService } from './delivery-report.service';
import { ConfigModule } from '../config';
import { MessagesModule } from '../messages/messages.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [ConfigModule, MessagesModule, forwardRef(() => GatewayModule)],
  providers: [WebhookService, DeliveryReportService],
  exports: [WebhookService, DeliveryReportService],
})
export class WebhookModule {}
