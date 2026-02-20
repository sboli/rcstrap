import { Module, Global } from '@nestjs/common';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as path from 'path';
import * as fs from 'fs';

export const DB_TOKEN = 'DRIZZLE_DB';

export type Db = BetterSQLite3Database<typeof schema>;

@Global()
@Module({
  providers: [
    {
      provide: DB_TOKEN,
      useFactory: (): Db => {
        const dbPath = process.env.DB_PATH ?? './data/rcstrap.sqlite';
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        const sqlite = new Database(dbPath);
        sqlite.pragma('journal_mode = WAL');
        sqlite.pragma('foreign_keys = ON');

        const db = drizzle(sqlite, { schema });

        // Auto-create tables if they don't exist
        sqlite.exec(`
          CREATE TABLE IF NOT EXISTS messages (
            id TEXT PRIMARY KEY,
            message_id TEXT NOT NULL,
            phone TEXT NOT NULL,
            direction TEXT NOT NULL CHECK(direction IN ('MT', 'MO')),
            status TEXT NOT NULL CHECK(status IN ('SENT', 'DELIVERED', 'READ', 'FAILED', 'REVOKED')),
            payload TEXT NOT NULL,
            agent_id TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now')),
            delivered_at TEXT,
            read_at TEXT,
            revoked_at TEXT
          );

          CREATE TABLE IF NOT EXISTS config_overrides (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT (datetime('now'))
          );

          CREATE TABLE IF NOT EXISTS files (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            content_type TEXT NOT NULL,
            url TEXT,
            local_path TEXT,
            size_bytes INTEGER,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          );

          CREATE INDEX IF NOT EXISTS idx_messages_phone ON messages(phone);
          CREATE INDEX IF NOT EXISTS idx_messages_message_id ON messages(message_id);
          CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
        `);

        return db;
      },
    },
  ],
  exports: [DB_TOKEN],
})
export class DbModule {}
