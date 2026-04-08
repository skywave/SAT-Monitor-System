// src/supervisor/supervisor.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SupervisorService {
  private readonly logger = new Logger(SupervisorService.name);

  constructor() {
    this.logger.log('SupervisorService initialized');
  }

  getStatus() {
    return {
      status: 'healthy',
      timestamp: new Date(),
    };
  }
}