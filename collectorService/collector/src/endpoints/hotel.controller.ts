// src/endpoints/hotel.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/hotel')
export class HotelController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  @Get('wakeupcall/list')
  async wakeupcallList() {
    return this.request('wakeupcall/list');
  }

  @Post('wakeupcall/get')
  async wakeupcallGet(@Body() body: { extension_id: string }) {
    return this.request('wakeupcall/get', 'POST', body);
  }

  @Post('wakeupcall/query')
  async wakeupcallQuery(@Body() body: { extension_ids: string[] }) {
    return this.request('wakeupcall/query', 'POST', body);
  }

  @Post('wakeupcall/create')
  async wakeupcallCreate(@Body() body: any) {
    return this.request('wakeupcall/create', 'POST', body);
  }

  @Post('wakeupcall/update')
  async wakeupcallUpdate(@Body() body: any) {
    return this.request('wakeupcall/update', 'POST', body);
  }

  @Post('wakeupcall/delete')
  async wakeupcallDelete(@Body() body: { extension_id: string; alarm_ids?: string[] }) {
    return this.request('wakeupcall/delete', 'GET', body);
  }

  @Post('checkout')
  async checkout(@Body() body: { extension_ids: string[] }) {
    return this.request('hotel/checkout', 'POST', body);
  }
}