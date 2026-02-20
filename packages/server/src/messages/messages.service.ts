import { Injectable, Inject } from '@nestjs/common';
import { DB_TOKEN, Db, messages } from '../db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import { MessageDirection, MessageStatus } from '../common/types';

@Injectable()
export class MessagesService {
  constructor(@Inject(DB_TOKEN) private db: Db) {}

  create(data: {
    messageId: string;
    phone: string;
    direction: MessageDirection;
    payload: Record<string, any>;
    agentId?: string;
  }) {
    const id = uuid();
    const row = {
      id,
      messageId: data.messageId,
      phone: data.phone,
      direction: data.direction,
      status: MessageStatus.SENT,
      payload: data.payload,
      agentId: data.agentId ?? null,
      createdAt: new Date().toISOString(),
    };

    this.db.insert(messages).values(row).run();
    return row;
  }

  findByPhone(phone: string, limit = 100, offset = 0) {
    return this.db
      .select()
      .from(messages)
      .where(eq(messages.phone, phone))
      .orderBy(desc(messages.createdAt))
      .limit(limit)
      .offset(offset)
      .all();
  }

  findByMessageId(messageId: string) {
    return this.db
      .select()
      .from(messages)
      .where(eq(messages.messageId, messageId))
      .get();
  }

  findById(id: string) {
    return this.db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .get();
  }

  updateStatus(messageId: string, status: MessageStatus) {
    const updates: Partial<Record<string, string>> = { status };
    if (status === MessageStatus.DELIVERED) updates.deliveredAt = new Date().toISOString();
    if (status === MessageStatus.READ) updates.readAt = new Date().toISOString();
    if (status === MessageStatus.REVOKED) updates.revokedAt = new Date().toISOString();

    this.db
      .update(messages)
      .set(updates as any)
      .where(eq(messages.messageId, messageId))
      .run();
  }

  getConversations() {
    const rows = this.db.all<{
      phone: string;
      lastMessage: string;
      lastCreatedAt: string;
      total: number;
    }>(sql`
      SELECT
        phone,
        payload as lastMessage,
        created_at as lastCreatedAt,
        COUNT(*) OVER (PARTITION BY phone) as total
      FROM messages
      WHERE (phone, created_at) IN (
        SELECT phone, MAX(created_at)
        FROM messages
        GROUP BY phone
      )
      ORDER BY created_at DESC
    `);

    return rows.map((r) => ({
      phone: r.phone,
      lastMessage: typeof r.lastMessage === 'string' ? JSON.parse(r.lastMessage) : r.lastMessage,
      lastCreatedAt: r.lastCreatedAt,
      messageCount: r.total,
    }));
  }
}
