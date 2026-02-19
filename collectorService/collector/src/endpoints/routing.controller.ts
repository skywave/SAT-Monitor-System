// src/endpoints/routing.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/route')
export class RoutingController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  // Inbound Routes
  @Get('inbound/list')
  async inboundList() {
    return this.request('inbound_route/list');
  }

  @Post('inbound/search')
  async inboundSearch(@Body() body: { name?: string }) {
    return this.request('inbound_route/search', 'POST', body);
  }

  @Post('inbound/get')
  async inboundGet(@Body() body: { id: string }) {
    return this.request('inbound_route/get', 'POST', body);
  }

  @Post('inbound/query')
  async inboundQuery(@Body() body: { ids: string[] }) {
    return this.request('inbound_route/query', 'POST', body);
  }

  @Post('inbound/create')
  async inboundCreate(@Body() body: any) {
    return this.request('inbound_route/create', 'POST', body);
  }

  @Post('inbound/update')
  async inboundUpdate(@Body() body: any) {
    return this.request('inbound_route/update', 'POST', body);
  }

  @Post('inbound/delete')
  async inboundDelete(@Body() body: { id: string }) {
    return this.request('inbound_route/delete', 'GET', body);
  }

  // Outbound Routes
  @Get('outbound/list')
  async outboundList() {
    return this.request('outbound_route/list');
  }

  @Post('outbound/search')
  async outboundSearch(@Body() body: { name?: string }) {
    return this.request('outbound_route/search', 'POST', body);
  }

  @Post('outbound/get')
  async outboundGet(@Body() body: { id: string }) {
    return this.request('outbound_route/get', 'POST', body);
  }

  @Post('outbound/query')
  async outboundQuery(@Body() body: { ids: string[] }) {
    return this.request('outbound_route/query', 'POST', body);
  }

  @Post('outbound/create')
  async outboundCreate(@Body() body: any) {
    return this.request('outbound_route/create', 'POST', body);
  }

  @Post('outbound/update')
  async outboundUpdate(@Body() body: any) {
    return this.request('outbound_route/update', 'POST', body);
  }

  @Post('outbound/delete')
  async outboundDelete(@Body() body: { id: string }) {
    return this.request('outbound_route/delete', 'GET', body);
  }
}