import { describe, it, expect } from 'vitest';
import { normalizeRbmPayload } from './normalize-rbm.middleware';

describe('normalizeRbmPayload', () => {
  // ---------------------------------------------------------------
  // Passthrough: already-flat payloads (rcstrap native format)
  // ---------------------------------------------------------------

  it('passes through a flat text message unchanged', () => {
    const flat = {
      messageId: 'abc',
      text: 'Hello',
      trafficType: 'PROMOTION',
      ttl: '60s',
    };
    expect(normalizeRbmPayload(flat)).toEqual(flat);
  });

  it('passes through a flat richCard message unchanged', () => {
    const flat = {
      messageId: 'rc-1',
      richCard: {
        standaloneCard: {
          cardOrientation: 'VERTICAL',
          cardContent: { title: 'Hi' },
        },
      },
      suggestions: [{ reply: { text: 'OK', postbackData: 'ok' } }],
    };
    expect(normalizeRbmPayload(flat)).toEqual(flat);
  });

  // ---------------------------------------------------------------
  // Google RBM format → flat format
  // ---------------------------------------------------------------

  it('unwraps contentMessage for a text message', () => {
    const rbm = {
      contentMessage: { text: 'Hello world' },
      messageTrafficType: 'PROMOTION',
      ttl: '172800s',
    };
    const result = normalizeRbmPayload(rbm);
    expect(result).toEqual({
      text: 'Hello world',
      trafficType: 'PROMOTION',
      ttl: '172800s',
    });
  });

  it('unwraps contentMessage for a richCard with suggestions', () => {
    const rbm = {
      contentMessage: {
        richCard: {
          standaloneCard: {
            cardOrientation: 'VERTICAL',
            thumbnailImageAlignment: 'LEFT',
            cardContent: {
              title: 'Titre de la carte',
              description: 'Hello world',
              media: {
                height: 'MEDIUM',
                contentInfo: {
                  fileUrl: 'https://example.com/image.jpg',
                  thumbnailUrl: 'https://example.com/thumb.jpg',
                },
              },
              suggestions: [
                {
                  action: {
                    text: 'BTN1',
                    postbackData: 'btn1_data',
                    openUrlAction: { url: 'https://sofy.fr' },
                  },
                },
              ],
            },
          },
        },
        suggestions: [
          {
            action: {
              text: 'Suggestion 1',
              postbackData: 'new_action_data',
            },
          },
        ],
      },
      messageTrafficType: 'PROMOTION',
      ttl: '172800s',
    };

    const result = normalizeRbmPayload(rbm);

    expect(result.richCard).toBeDefined();
    expect(result.richCard.standaloneCard.cardOrientation).toBe('VERTICAL');
    expect(result.richCard.standaloneCard.thumbnailImageAlignment).toBe('LEFT');
    expect(result.richCard.standaloneCard.cardContent.title).toBe(
      'Titre de la carte',
    );
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].action.text).toBe('Suggestion 1');
    expect(result.trafficType).toBe('PROMOTION');
    expect(result.ttl).toBe('172800s');
    // contentMessage wrapper must be gone
    expect(result.contentMessage).toBeUndefined();
    expect(result.messageTrafficType).toBeUndefined();
  });

  it('unwraps contentMessage for a contentInfo (file) message', () => {
    const rbm = {
      contentMessage: {
        contentInfo: {
          fileUrl: 'https://example.com/file.pdf',
          forceRefresh: true,
        },
      },
      messageTrafficType: 'TRANSACTION',
    };
    const result = normalizeRbmPayload(rbm);
    expect(result).toEqual({
      contentInfo: {
        fileUrl: 'https://example.com/file.pdf',
        forceRefresh: true,
      },
      trafficType: 'TRANSACTION',
    });
  });

  it('unwraps contentMessage for a carousel', () => {
    const rbm = {
      contentMessage: {
        richCard: {
          carouselCard: {
            cardWidth: 'MEDIUM',
            cardContents: [
              { title: 'A', description: 'First' },
              { title: 'B', description: 'Second' },
            ],
          },
        },
      },
      messageTrafficType: 'PROMOTION',
      ttl: '60s',
    };
    const result = normalizeRbmPayload(rbm);
    expect(result.richCard.carouselCard.cardContents).toHaveLength(2);
    expect(result.trafficType).toBe('PROMOTION');
    expect(result.contentMessage).toBeUndefined();
  });

  // ---------------------------------------------------------------
  // Output-only fields are stripped
  // ---------------------------------------------------------------

  it('strips output-only fields: name, sendTime, richMessageClassification, totalPayloadSizeBytes, carrier', () => {
    const rbm = {
      name: 'phones/+15551234567/agentMessages/uuid-123',
      sendTime: '2026-02-20T19:38:11Z',
      richMessageClassification: {
        classificationType: 'RICH_MESSAGE',
        segmentCount: 2,
      },
      totalPayloadSizeBytes: '1234',
      carrier: 'some-carrier',
      contentMessage: { text: 'hi' },
      messageTrafficType: 'AUTHENTICATION',
      ttl: '60s',
    };
    const result = normalizeRbmPayload(rbm);
    expect(result.name).toBeUndefined();
    expect(result.sendTime).toBeUndefined();
    expect(result.richMessageClassification).toBeUndefined();
    expect(result.totalPayloadSizeBytes).toBeUndefined();
    expect(result.carrier).toBeUndefined();
    expect(result.text).toBe('hi');
    expect(result.trafficType).toBe('AUTHENTICATION');
  });

  // ---------------------------------------------------------------
  // messageTrafficType mapping
  // ---------------------------------------------------------------

  it.each([
    'AUTHENTICATION',
    'TRANSACTION',
    'PROMOTION',
    'SERVICEREQUEST',
    'ACKNOWLEDGEMENT',
  ])('maps messageTrafficType=%s to trafficType', (type) => {
    const rbm = {
      contentMessage: { text: 'test' },
      messageTrafficType: type,
    };
    const result = normalizeRbmPayload(rbm);
    expect(result.trafficType).toBe(type);
    expect(result.messageTrafficType).toBeUndefined();
  });

  it('omits trafficType when messageTrafficType is absent', () => {
    const rbm = { contentMessage: { text: 'test' } };
    const result = normalizeRbmPayload(rbm);
    expect(result.trafficType).toBeUndefined();
  });

  // ---------------------------------------------------------------
  // Query param handling (messageId)
  // ---------------------------------------------------------------

  it('picks up messageId from query params', () => {
    const rbm = { contentMessage: { text: 'test' } };
    const query = { messageId: 'query-uuid-1', agentId: 'agent-1' };
    const result = normalizeRbmPayload(rbm, query);
    expect(result.messageId).toBe('query-uuid-1');
  });

  it('does not override body messageId with query param', () => {
    const flat = { messageId: 'body-uuid', text: 'test' };
    const query = { messageId: 'query-uuid' };
    const result = normalizeRbmPayload(flat, query);
    expect(result.messageId).toBe('body-uuid');
  });

  it('works with no query params', () => {
    const rbm = { contentMessage: { text: 'test' } };
    const result = normalizeRbmPayload(rbm);
    expect(result.messageId).toBeUndefined();
    expect(result.text).toBe('test');
  });

  // ---------------------------------------------------------------
  // ttl and expireTime are preserved at top level
  // ---------------------------------------------------------------

  it('preserves ttl from top level (not inside contentMessage)', () => {
    const rbm = {
      contentMessage: { text: 'hi' },
      ttl: '172800s',
    };
    const result = normalizeRbmPayload(rbm);
    expect(result.ttl).toBe('172800s');
    expect(result.text).toBe('hi');
  });

  it('preserves expireTime from top level', () => {
    const rbm = {
      contentMessage: { text: 'hi' },
      expireTime: '2026-03-01T10:00:00Z',
    };
    const result = normalizeRbmPayload(rbm);
    expect(result.expireTime).toBe('2026-03-01T10:00:00Z');
  });

  // ---------------------------------------------------------------
  // Real-world payload from Go backend (exact log reproduction)
  // ---------------------------------------------------------------

  it('normalizes the exact payload from Go backend', () => {
    // This is the exact payload structure the Go backend sends,
    // based on rcs.AgentMessage in internal/rcs/models.go
    const goPayload = {
      contentMessage: {
        suggestions: [
          {
            action: {
              text: 'Suggestion 1',
              postbackData: 'new_action_data',
            },
          },
        ],
        richCard: {
          standaloneCard: {
            cardOrientation: 'VERTICAL',
            thumbnailImageAlignment: 'LEFT',
            cardContent: {
              title: 'Titre de la carte',
              description: 'Hello world',
              media: {
                height: 'MEDIUM',
                contentInfo: {
                  fileUrl:
                    'https://sofy-next-staging.s3.eu-west-1.amazonaws.com/campaigns/rcs/abc/def',
                  thumbnailUrl:
                    'https://svc.gw.sofy.fr/medias/images/thumbnail?url=https://example.com&preset=lg',
                },
              },
              suggestions: [
                {
                  action: {
                    text: 'BTN1',
                    postbackData: 'new_action_data',
                    openUrlAction: { url: 'https://sofy.fr' },
                  },
                },
              ],
            },
          },
        },
      },
      messageTrafficType: 'PROMOTION',
      ttl: '172800s',
    };
    const query = {
      agentId: 'test-agent',
      messageId: 'uuid-from-query',
    };

    const result = normalizeRbmPayload(goPayload, query);

    // Flat structure
    expect(result.contentMessage).toBeUndefined();
    expect(result.messageTrafficType).toBeUndefined();

    // Content unwrapped
    expect(result.richCard.standaloneCard.cardOrientation).toBe('VERTICAL');
    expect(result.richCard.standaloneCard.cardContent.title).toBe(
      'Titre de la carte',
    );
    expect(result.richCard.standaloneCard.cardContent.media.contentInfo.fileUrl).toContain(
      'sofy-next-staging',
    );

    // Top-level suggestions from contentMessage
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].action.text).toBe('Suggestion 1');

    // Card-level suggestions preserved inside cardContent
    expect(
      result.richCard.standaloneCard.cardContent.suggestions,
    ).toHaveLength(1);
    expect(
      result.richCard.standaloneCard.cardContent.suggestions[0].action
        .openUrlAction.url,
    ).toBe('https://sofy.fr');

    // Mapped fields
    expect(result.trafficType).toBe('PROMOTION');
    expect(result.ttl).toBe('172800s');
    expect(result.messageId).toBe('uuid-from-query');
  });

  // ---------------------------------------------------------------
  // Edge cases
  // ---------------------------------------------------------------

  it('handles null/undefined body gracefully', () => {
    expect(normalizeRbmPayload(null as any)).toBeNull();
    expect(normalizeRbmPayload(undefined as any)).toBeUndefined();
  });

  it('handles empty body', () => {
    expect(normalizeRbmPayload({})).toEqual({});
  });

  it('handles uploadedRbmFile content type', () => {
    const rbm = {
      contentMessage: {
        uploadedRbmFile: {
          fileName: 'files/abc123',
          thumbnailName: 'files/thumb456',
        },
      },
      messageTrafficType: 'TRANSACTION',
    };
    const result = normalizeRbmPayload(rbm);
    expect(result.uploadedRbmFile).toEqual({
      fileName: 'files/abc123',
      thumbnailName: 'files/thumb456',
    });
    expect(result.trafficType).toBe('TRANSACTION');
  });

  it('handles all suggestion action types in contentMessage', () => {
    const rbm = {
      contentMessage: {
        text: 'Try all these actions:',
        suggestions: [
          {
            action: {
              text: 'Call Us',
              postbackData: 'dial',
              dialAction: { phoneNumber: '+15559876543' },
            },
          },
          {
            action: {
              text: 'Find Us',
              postbackData: 'loc',
              viewLocationAction: {
                latLong: { latitude: 40.7128, longitude: -74.006 },
                label: 'NYC Office',
              },
            },
          },
          {
            action: {
              text: 'Share',
              postbackData: 'share',
              shareLocationAction: {},
            },
          },
          {
            action: {
              text: 'Calendar',
              postbackData: 'cal',
              createCalendarEventAction: {
                title: 'Meeting',
                description: 'Sync',
                startTime: '2026-03-01T10:00:00Z',
                endTime: '2026-03-01T11:00:00Z',
              },
            },
          },
          {
            action: {
              text: 'Open',
              postbackData: 'url',
              fallbackUrl: 'https://fallback.example.com',
              openUrlAction: {
                url: 'https://example.com',
                application: 'WEBVIEW',
                webviewViewMode: 'FULL',
                description: 'Open site',
              },
            },
          },
        ],
      },
      messageTrafficType: 'PROMOTION',
    };
    const result = normalizeRbmPayload(rbm);
    expect(result.text).toBe('Try all these actions:');
    expect(result.suggestions).toHaveLength(5);
    expect(result.suggestions[0].action.dialAction.phoneNumber).toBe(
      '+15559876543',
    );
    expect(result.suggestions[4].action.fallbackUrl).toBe(
      'https://fallback.example.com',
    );
    expect(result.suggestions[4].action.openUrlAction.application).toBe(
      'WEBVIEW',
    );
  });
});
