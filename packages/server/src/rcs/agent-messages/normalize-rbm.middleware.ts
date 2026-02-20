import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Transforms a Google RBM AgentMessage payload into rcstrap's flat format.
 *
 * Google RBM API sends (POST body):
 *   {
 *     contentMessage: { text|richCard|contentInfo|uploadedRbmFile, suggestions },
 *     messageTrafficType: "PROMOTION",
 *     ttl: "172800s",
 *     expireTime: "...",
 *     name: "phones/+.../agentMessages/...",   // output-only, ignored
 *     sendTime: "...",                          // output-only, ignored
 *   }
 *
 * rcstrap expects (flat):
 *   { text|richCard|contentInfo|uploadedRbmFile, suggestions, trafficType, ttl, ... }
 *
 * Query params messageId and agentId are also moved into the body.
 */
export function normalizeRbmPayload(
  body: Record<string, any>,
  query?: Record<string, any>,
): Record<string, any> {
  let result = body;

  if (body?.contentMessage) {
    const {
      contentMessage,
      messageTrafficType,
      // Strip output-only fields
      name: _name,
      sendTime: _sendTime,
      richMessageClassification: _rmc,
      totalPayloadSizeBytes: _tpsb,
      carrier: _carrier,
      ...topLevel
    } = body;

    result = {
      ...topLevel,
      ...contentMessage,
      ...(messageTrafficType ? { trafficType: messageTrafficType } : {}),
    };
  }

  if (query?.messageId && !result.messageId) {
    result = { ...result, messageId: query.messageId as string };
  }

  return result;
}

@Injectable()
export class NormalizeRbmMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    req.body = normalizeRbmPayload(req.body, req.query);
    next();
  }
}
