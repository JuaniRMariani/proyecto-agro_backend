import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
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
