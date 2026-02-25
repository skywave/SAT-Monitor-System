// src/endpoints/storage.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/storage')
export class StorageController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  @Get('list')
  async list() {
    return this.request('storage/list');
  }

  // Backup
  @Get('backup/list')
  async backupList() {
    return this.request('backup/list');
  }

  @Post('backup/search')
  async backupSearch(@Body() body: any) {
    return this.request('backup/search', 'POST', body);
  }

  @Post('backup/get')
  async backupGet(@Body() body: { id: string }) {
    return this.request('backup/get', 'POST', body);
  }

  @Post('backup/query')
  async backupQuery(@Body() body: { ids: string[] }) {
    return this.request('backup/query', 'POST', body);
  }

  @Post('backup/getstatus')
  async backupGetStatus(@Body() body: { id: string }) {
    return this.request('backup/getstatus', 'POST', body);
  }

  @Post('backup/download')
  async backupDownload(@Body() body: { id: string }) {
    return this.request('backup/download', 'POST', body);
  }

  @Post('backup/create')
  async backupCreate(@Body() body: any) {
    return this.request('backup/create', 'POST', body);
  }

  @Post('backup/delete')
  async backupDelete(@Body() body: { id: string }) {
    return this.request('backup/delete', 'GET', body);
  }

  // System Log
  @Get('systemlog/list')
  async systemlogList() {
    return this.request('system_log/list');
  }

  @Post('systemlog/download')
  async systemlogDownload(@Body() body: { ids: string[] }) {
    return this.request('system_log/download', 'POST', body);
  }
}