// src/endpoints/trunk.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/trunk')
export class TrunkController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  @Post('search')
  async search(@Body() body: { name?: string; type?: string }) {
    return this.request('trunk/search', 'POST', body);
  }

  @Post('get')
  async get(@Body() body: { id: string }) {
    return this.request('trunk/get', 'POST', body);
  }

  @Post('query')
  async query(@Body() body: { ids: string[] }) {
    return this.request('trunk/query', 'POST', body);
  }

  @Get('itsp_list')
  async itspList() {
    return this.request('trunk/itsp_list');
  }

  @Post('create')
  async create(@Body() body: any) {
    return this.request('trunk/create', 'POST', body);
  }

  @Post('update')
  async update(@Body() body: any) {
    return this.request('trunk/update', 'POST', body);
  }

  @Post('delete')
  async delete(@Body() body: { id: string }) {
    return this.request('trunk/delete', 'GET', body);
  }
}