/**
 * snapshot.controller.ts
 *
 * Serves the cached snapshot contract previously provided by the
 * retired plain-Node Collector (port 3001):
 *   GET /api/trunk/list
 *   GET /api/cdr/list?page=1&page_size=500
 *   GET /api/system/information
 *   GET /api/health
 *   GET /api/cache/status
 */

import { Controller, Get, Query, ServiceUnavailableException } from '@nestjs/common';
import { SnapshotService } from './snapshot.service';

@Controller('api')
export class SnapshotController {
  constructor(private readonly snapshotService: SnapshotService) {}

  @Get('trunk/list')
  trunkList() {
    const trunks = this.snapshotService.getTrunkList();
    return {
      errcode: 0,
      errmsg: 'SUCCESS',
      total_number: trunks.length,
      data: trunks,
    };
  }

  @Get('cdr/list')
  cdrList(
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    const p = parseInt(page || '1', 10) || 1;
    const s = parseInt(pageSize || '500', 10) || 500;
    const result = this.snapshotService.getCdrList(p, s);
    return {
      errcode: 0,
      errmsg: 'SUCCESS',
      total_number: result.total_number,
      data: result.data,
    };
  }

  @Get('system/information')
  systemInformation() {
    const info = this.snapshotService.getSystemInfo();
    if (!info) {
      throw new ServiceUnavailableException({
        success: false,
        error: 'System info not available',
      });
    }
    return info;
  }

  @Get('health')
  health() {
    return this.snapshotService.getHealth();
  }

  @Get('cache/status')
  cacheStatus() {
    return this.snapshotService.getCacheStatus();
  }
}