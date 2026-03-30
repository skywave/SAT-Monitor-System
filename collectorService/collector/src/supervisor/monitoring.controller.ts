import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MonitoringService } from './monitoring.service';

@Controller('api/monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('status')
  async getStatus() {
    return this.monitoringService.getStatus();
  }

  @Get('health')
  getHealth() {
    return { status: 'healthy', timestamp: new Date().toISOString() };
  }

  @Get('dashboard')
  getDashboard(@Res() res: Response) {
    const html = `...put your full HTML dashboard here...`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
