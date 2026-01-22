import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): {
    name: string;
    status: 'ok';
    message: string;
    timestamp: string;
    basePath: string;
    docs: string;
  } {
    return {
      name: 'Proyecto Agro API',
      status: 'ok',
      message: 'Welcome. Use /api for all endpoints.',
      timestamp: new Date().toISOString(),
      basePath: '/api',
      docs: '/api/docs',
    };
  }
}
