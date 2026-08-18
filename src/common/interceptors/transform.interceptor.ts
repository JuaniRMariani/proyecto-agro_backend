import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiResponse } from './api-response.interface';
import { map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import type { Response } from 'express';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse<T>
> {
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> | Promise<Observable<ApiResponse<T>>> {
    const customMessage = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY,
      context.getHandler(),
    );
    return next.handle().pipe(
      map(
        (data) =>
          ({
            success: true,
            data,
            message:
              customMessage || 'La solicitud se ha procesado correctamente',
            statusCode: context.switchToHttp().getResponse<Response>()
              .statusCode,
            timestamp: new Date().toISOString(),
          }) as ApiResponse<T>,
      ),
    );
  }
}
