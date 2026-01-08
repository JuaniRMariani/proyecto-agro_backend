import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    let errorMessage: string;

    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse.message
    ) {
      if (Array.isArray(exceptionResponse.message)) {
        errorMessage = exceptionResponse.message.join(', ');
      } else {
        errorMessage = exceptionResponse.message;
      }
    } else {
      errorMessage = 'Ocurrió un error inesperado';
    }
    const errorResponse = {
      success: false,
      message: errorMessage,
      statusCode: status,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
