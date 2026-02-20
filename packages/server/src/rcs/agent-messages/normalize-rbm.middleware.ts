import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Normalizes Google RBM API format into rcstrap's flat format.
 *
 * Google RBM sends:
 *   { contentMessage: { text, richCard, suggestions, ... }, messageTrafficType, ttl }
 *
 * rcstrap expects:
 *   { text, richCard, suggestions, ..., trafficType, ttl }
 *
 * Also picks up messageId/agentId from query params.
 */
@Injectable()
export class NormalizeRbmMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const body = req.body;
    if (body && body.contentMessage) {
      const { contentMessage, messageTrafficType, name, sendTime, ...rest } =
        body;
      req.body = {
        ...rest,
        ...contentMessage,
        ...(messageTrafficType ? { trafficType: messageTrafficType } : {}),
      };
    }

    // Google RBM client sends messageId as query param
    if (req.query.messageId && !req.body.messageId) {
      req.body.messageId = req.query.messageId;
    }

    next();
  }
}
