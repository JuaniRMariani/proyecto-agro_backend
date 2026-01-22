import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
@ApiTags('health')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({
    schema: {
      example: {
        name: 'Proyecto Agro API',
        status: 'ok',
        message: 'Welcome. Use /api for all endpoints.',
        timestamp: '2026-01-22T00:00:00.000Z',
        basePath: '/api',
        docs: '/api/docs',
      },
    },
  })
  getHello(): {
    name: string;
    status: 'ok';
    message: string;
    timestamp: string;
    basePath: string;
    docs: string;
  } {
    return this.appService.getHello();
  }
}
