// src/endpoints/voicemail.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/voicemail')
export class VoicemailController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  @Post('query')
  async query(@Body() body: { extension_ids?: string[]; page?: number; page_size?: number }) {
    return this.request('vm/query', 'POST', body);
  }

  @Post('get')
  async get(@Body() body: { id: string }) {
    return this.request('vm/get', 'POST', body);
  }

  @Post('download')
  async download(@Body() body: { id: string }) {
    return this.request('vm/download', 'POST', body);
  }

  @Post('create')
  async create(@Body() body: any) {
    return this.request('vm/create', 'POST', body);
  }

  @Post('update')
  async update(@Body() body: { id: string; read_status?: string }) {
    return this.request('vm/update', 'POST', body);
  }

  @Post('delete')
  async delete(@Body() body: { id: string }) {
    return this.request('vm/delete', 'GET', body);
  }

  @Post('delete_extension_vm')
  async deleteExtensionVm(@Body() body: { extension_id: string }) {
    return this.request('vm/delete_extension_vm', 'GET', body);
  }
}