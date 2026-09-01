import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'Zerify API Working Properly',
      timestamp: new Date().toISOString(),
    };
  }
}
