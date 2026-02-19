// src/endpoints/organization.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/organization')
export class OrganizationController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  @Get('list')
  async list() {
    return this.request('organization/list');
  }

  @Post('search')
  async search(@Body() body: { name?: string }) {
    return this.request('organization/search', 'POST', body);
  }

  @Post('get')
  async get(@Body() body: { id: string }) {
    return this.request('organization/get', 'POST', body);
  }

  @Post('query')
  async query(@Body() body: { ids: string[] }) {
    return this.request('organization/query', 'POST', body);
  }

  @Post('create')
  async create(@Body() body: any) {
    return this.request('organization/create', 'POST', body);
  }

  @Post('update')
  async update(@Body() body: any) {
    return this.request('organization/update', 'POST', body);
  }

  @Post('delete')
  async delete(@Body() body: { id: string }) {
    return this.request('organization/delete', 'GET', body);
  }
}