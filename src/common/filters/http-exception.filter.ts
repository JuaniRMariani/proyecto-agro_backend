import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

interface ExceptionPayload {
  message: string | string[];
}

function hasMessage(value: object): value is ExceptionPayload {
  if (!('message' in value)) return false;
  const message = value.message;
  return (
    typeof message === 'string' ||
    (Array.isArray(message) &&
      message.every((item) => typeof item === 'string'))
  );
}

function extractMessage(exceptionResponse: unknown): string {
  if (typeof exceptionResponse === 'string') return exceptionResponse;
  if (
    typeof exceptionResponse === 'object' &&
    exceptionResponse !== null &&
    hasMessage(exceptionResponse)
  ) {
    return Array.isArray(exceptionResponse.message)
      ? exceptionResponse.message.join(', ')
      : exceptionResponse.message;
  }
  return 'Ocurrió un error inesperado';
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    response.status(status).json({
      success: false,
      message: extractMessage(exception.getResponse()),
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
