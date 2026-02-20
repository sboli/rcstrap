import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(),
  messageId: text('message_id').notNull(),
  phone: text('phone').notNull(),
  direction: text('direction', { enum: ['MT', 'MO'] }).notNull(),
  status: text('status', {
    enum: ['SENT', 'DELIVERED', 'READ', 'FAILED', 'REVOKED'],
  }).notNull(),
  payload: text('payload', { mode: 'json' }).notNull().$type<Record<string, any>>(),
  agentId: text('agent_id'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
  deliveredAt: text('delivered_at'),
  readAt: text('read_at'),
  revokedAt: text('revoked_at'),
});

export const configOverrides = sqliteTable('config_overrides', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const files = sqliteTable('files', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  contentType: text('content_type').notNull(),
  url: text('url'),
  localPath: text('local_path'),
  sizeBytes: integer('size_bytes'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`(datetime('now'))`),
});
