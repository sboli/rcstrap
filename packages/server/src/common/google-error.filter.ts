import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { GoogleErrorResponse } from './types';

@Catch(HttpException)
export class GoogleErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const errorBody: GoogleErrorResponse = {
      error: {
        code: status,
        message: typeof exceptionResponse === 'string'
          ? exceptionResponse
          : exceptionResponse.message || exception.message,
        status: this.httpStatusToGrpc(status),
      },
    };

    if (exception instanceof BadRequestException && exceptionResponse.message) {
      const messages = Array.isArray(exceptionResponse.message)
        ? exceptionResponse.message
        : [exceptionResponse.message];

      errorBody.error.details = [
        {
          '@type': 'type.googleapis.com/google.rpc.BadRequest',
          fieldViolations: messages.map((msg: string) => ({
            field: this.extractField(msg),
            description: msg,
          })),
        },
      ];
    }

    response.status(status).json(errorBody);
  }

  private httpStatusToGrpc(status: number): string {
    const map: Record<number, string> = {
      400: 'INVALID_ARGUMENT',
      401: 'UNAUTHENTICATED',
      403: 'PERMISSION_DENIED',
      404: 'NOT_FOUND',
      409: 'ALREADY_EXISTS',
      429: 'RESOURCE_EXHAUSTED',
      500: 'INTERNAL',
    };
    return map[status] ?? 'UNKNOWN';
  }

  private extractField(msg: string): string {
    const match = msg.match(/^(\w[\w.]*)/);
    return match ? match[1] : 'unknown';
  }
}
