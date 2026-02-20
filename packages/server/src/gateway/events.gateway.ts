import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  emitMessageNew(message: any) {
    this.server?.emit('message:new', message);
  }

  emitMessageStatus(messageId: string, phone: string, status: string) {
    this.server?.emit('message:status', { messageId, phone, status });
  }

  emitMessageRevoked(messageId: string, phone: string) {
    this.server?.emit('message:revoked', { messageId, phone });
  }

  emitAgentEvent(phone: string, event: any) {
    this.server?.emit('agent:event', { phone, ...event });
  }

  emitConfigChanged(config: any) {
    this.server?.emit('config:changed', config);
  }
}
