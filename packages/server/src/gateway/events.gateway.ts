import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  private messageBuffer: any[] = [];
  private statusBuffer: any[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;

  private get hasClients(): boolean {
    return (this.server?.sockets?.sockets?.size ?? 0) > 0;
  }

  private scheduleFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flush();
      this.flushTimer = null;
    }, 100);
  }

  private flush() {
    if (!this.hasClients) {
      this.messageBuffer.length = 0;
      this.statusBuffer.length = 0;
      return;
    }

    if (this.messageBuffer.length > 0) {
      if (this.messageBuffer.length === 1) {
        this.server.emit('message:new', this.messageBuffer[0]);
      } else {
        this.server.emit('message:batch', this.messageBuffer);
      }
      this.messageBuffer = [];
    }

    if (this.statusBuffer.length > 0) {
      for (const s of this.statusBuffer) {
        this.server.emit('message:status', s);
      }
      this.statusBuffer = [];
    }
  }

  emitMessageNew(message: any) {
    this.messageBuffer.push(message);
    this.scheduleFlush();
  }

  emitMessageStatus(messageId: string, phone: string, status: string) {
    this.statusBuffer.push({ messageId, phone, status });
    this.scheduleFlush();
  }

  emitMessageRevoked(messageId: string, phone: string) {
    if (!this.hasClients) return;
    this.server.emit('message:revoked', { messageId, phone });
  }

  emitAgentEvent(phone: string, event: any) {
    if (!this.hasClients) return;
    this.server.emit('agent:event', { phone, ...event });
  }

  emitConfigChanged(config: any) {
    if (!this.hasClients) return;
    this.server.emit('config:changed', config);
  }
}
