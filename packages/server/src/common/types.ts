export enum MessageDirection {
  /** Agent → user (MT) */
  MT = 'MT',
  /** User → agent (MO) */
  MO = 'MO',
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  REVOKED = 'REVOKED',
}

export enum EventType {
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  IS_TYPING = 'IS_TYPING',
}

export interface RcsCapabilities {
  RICHCARD_STANDALONE: boolean;
  RICHCARD_CAROUSEL: boolean;
  ACTION_CREATE_CALENDAR_EVENT: boolean;
  ACTION_DIAL: boolean;
  ACTION_OPEN_URL: boolean;
  ACTION_SHARE_LOCATION: boolean;
  ACTION_VIEW_LOCATION: boolean;
}

export const DEFAULT_CAPABILITIES: RcsCapabilities = {
  RICHCARD_STANDALONE: true,
  RICHCARD_CAROUSEL: true,
  ACTION_CREATE_CALENDAR_EVENT: true,
  ACTION_DIAL: true,
  ACTION_OPEN_URL: true,
  ACTION_SHARE_LOCATION: true,
  ACTION_VIEW_LOCATION: true,
};

export interface GoogleErrorResponse {
  error: {
    code: number;
    message: string;
    status: string;
    details?: Array<{
      '@type': string;
      fieldViolations?: Array<{
        field: string;
        description: string;
      }>;
    }>;
  };
}
