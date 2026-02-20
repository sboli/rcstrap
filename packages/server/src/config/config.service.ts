import { Injectable, Inject } from '@nestjs/common';
import { DB_TOKEN, Db, configOverrides } from '../db';
import { eq } from 'drizzle-orm';
import { DEFAULT_CAPABILITIES, RcsCapabilities } from '../common/types';

export interface AppConfig {
  webhookUrl: string;
  webhookTimeoutMs: number;
  deliveryReportDeliveredPct: number;
  deliveryReportReadPct: number;
  deliveryReportIsTypingEnabled: boolean;
  deliveryReportDelayMs: number;
  defaultCapabilities: RcsCapabilities;
  agentId: string;
  port: number;
}

const CONFIG_KEYS: Record<keyof AppConfig, { env: string; default: string }> = {
  webhookUrl: { env: 'WEBHOOK_URL', default: 'http://localhost:8080/webhook' },
  webhookTimeoutMs: { env: 'WEBHOOK_TIMEOUT_MS', default: '5000' },
  deliveryReportDeliveredPct: { env: 'DELIVERY_REPORT_DELIVERED_PCT', default: '80' },
  deliveryReportReadPct: { env: 'DELIVERY_REPORT_READ_PCT', default: '10' },
  deliveryReportIsTypingEnabled: { env: 'DELIVERY_REPORT_IS_TYPING_ENABLED', default: 'true' },
  deliveryReportDelayMs: { env: 'DELIVERY_REPORT_DELAY_MS', default: '1000' },
  defaultCapabilities: { env: 'DEFAULT_CAPABILITIES', default: JSON.stringify(DEFAULT_CAPABILITIES) },
  agentId: { env: 'AGENT_ID', default: 'rcstrap-test-agent' },
  port: { env: 'PORT', default: '3000' },
};

@Injectable()
export class ConfigService {
  constructor(@Inject(DB_TOKEN) private db: Db) {}

  private getRaw(key: keyof AppConfig): string {
    // Priority: UI override > env > default
    const override = this.db
      .select()
      .from(configOverrides)
      .where(eq(configOverrides.key, key))
      .get();

    if (override) return override.value;

    const envVal = process.env[CONFIG_KEYS[key].env];
    if (envVal !== undefined) return envVal;

    return CONFIG_KEYS[key].default;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    const raw = this.getRaw(key);

    // Type coercion based on the default value type
    const def = CONFIG_KEYS[key].default;
    if (def === 'true' || def === 'false') return (raw === 'true') as any;
    if (!isNaN(Number(def)) && def !== '') return Number(raw) as any;
    if (def.startsWith('{') || def.startsWith('[')) {
      try { return JSON.parse(raw) as any; } catch { return JSON.parse(def) as any; }
    }
    return raw as any;
  }

  getAll(): AppConfig {
    return Object.keys(CONFIG_KEYS).reduce((acc, key) => {
      acc[key as keyof AppConfig] = this.get(key as keyof AppConfig);
      return acc;
    }, {} as any);
  }

  set(key: keyof AppConfig, value: string): void {
    this.db
      .insert(configOverrides)
      .values({ key, value, updatedAt: new Date().toISOString() })
      .onConflictDoUpdate({
        target: configOverrides.key,
        set: { value, updatedAt: new Date().toISOString() },
      })
      .run();
  }

  reset(key: keyof AppConfig): void {
    this.db.delete(configOverrides).where(eq(configOverrides.key, key)).run();
  }

  resetAll(): void {
    this.db.delete(configOverrides).run();
  }
}
