// src/endpoints/extension.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/extension')
export class ExtensionController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  @Get('list')
  async list() {
    return this.request('extension/list');
  }

  @Post('search')
  async search(@Body() body: { name?: string; number?: string }) {
    return this.request('extension/search', 'POST', body);
  }

  @Post('get')
  async get(@Body() body: { id: string }) {
    return this.request('extension/get', 'POST', body);
  }

  @Post('query')
  async query(@Body() body: { ids: string[] }) {
    return this.request('extension/query', 'POST', body);
  }

  @Post('getpassword')
  async getPassword(@Body() body: { id: string }) {
    return this.request('extension/getpassword', 'POST', body);
  }

  @Post('create')
  async create(@Body() body: any) {
    return this.request('extension/create', 'POST', body);
  }

  @Post('update')
  async update(@Body() body: any) {
    return this.request('extension/update', 'POST', body);
  }

  @Post('delete')
  async delete(@Body() body: { id: string }) {
    return this.request('extension/delete', 'GET', body);
  }

  @Post('send_welcome_email')
  async sendWelcomeEmail(@Body() body: { ids: string[] }) {
    return this.request('extension/send_welcome_email', 'POST', body);
  }
}