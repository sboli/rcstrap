import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DbModule } from './db';
import { ConfigModule } from './config';
import { MessagesModule } from './messages/messages.module';
import { RcsModule } from './rcs/rcs.module';
import { WebhookModule } from './webhook/webhook.module';
import { GatewayModule } from './gateway/gateway.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GoogleErrorFilter } from './common/google-error.filter';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'web', 'dist'),
      exclude: ['/v1', '/upload', '/api'],
    }),
    DbModule,
    ConfigModule,
    MessagesModule,
    RcsModule,
    WebhookModule,
    GatewayModule,
    DashboardModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GoogleErrorFilter,
    },
  ],
})
export class AppModule {}
