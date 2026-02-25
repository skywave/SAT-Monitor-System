// src/endpoints/monitoring.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/monitor')
export class MonitoringController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  // Extension Status Monitor
  @Get('extension_status/list')
  async extensionStatusList() {
    return this.request('extension_status_monitor/list');
  }

  @Post('extension_status/update')
  async extensionStatusUpdate(@Body() body: any) {
    return this.request('extension_status_monitor/update', 'POST', body);
  }

  // Trunk Status Monitor
  @Get('trunk_status/list')
  async trunkStatusList() {
    return this.request('trunk_status_monitor/list');
  }

  @Post('trunk_status/update')
  async trunkStatusUpdate(@Body() body: any) {
    return this.request('trunk_status_monitor/update', 'POST', body);
  }

  // Webhook
  @Post('webhook/query')
  async webhookQuery(@Body() body?: any) {
    return this.request('webhook/query', 'POST', body);
  }

  @Post('webhook/update')
  async webhookUpdate(@Body() body: any) {
    return this.request('webhook/update', 'POST', body);
  }

  @Post('webhook/test')
  async webhookTest(@Body() body: { url: string }) {
    return this.request('webhook/test', 'POST', body);
  }

  // WebSocket Audio Streaming
  @Get('audiostream/get')
  async audiostreamGet() {
    return this.request('websocketaudiostream/get');
  }

  @Post('audiostream/update')
  async audiostreamUpdate(@Body() body: any) {
    return this.request('websocketaudiostream/update', 'POST', body);
  }

  // PIN List
  @Get('pinlist/list')
  async pinlistList() {
    return this.request('pin_list/list');
  }

  @Post('pinlist/search')
  async pinlistSearch(@Body() body: any) {
    return this.request('pin_list/search', 'POST', body);
  }

  @Post('pinlist/get')
  async pinlistGet(@Body() body: { id: string }) {
    return this.request('pin_list/get', 'POST', body);
  }

  @Post('pinlist/query')
  async pinlistQuery(@Body() body: { ids: string[] }) {
    return this.request('pin_list/query', 'POST', body);
  }

  @Post('pinlist/create')
  async pinlistCreate(@Body() body: any) {
    return this.request('pin_list/create', 'POST', body);
  }

  @Post('pinlist/update')
  async pinlistUpdate(@Body() body: any) {
    return this.request('pin_list/update', 'POST', body);
  }

  @Post('pinlist/delete')
  async pinlistDelete(@Body() body: { id: string }) {
    return this.request('pin_list/delete', 'GET', body);
  }

  // Block/Allow Numbers
  @Get('blocknumbers/list')
  async blocknumbersList() {
    return this.request('block_numbers/list');
  }

  @Post('blocknumbers/search')
  async blocknumbersSearch(@Body() body: any) {
    return this.request('block_numbers/search', 'POST', body);
  }

  @Post('blocknumbers/get')
  async blocknumbersGet(@Body() body: { id: string }) {
    return this.request('block_numbers/get', 'POST', body);
  }

  @Post('blocknumbers/query')
  async blocknumbersQuery(@Body() body: { ids: string[] }) {
    return this.request('block_numbers/query', 'POST', body);
  }

  @Post('blocknumbers/create')
  async blocknumbersCreate(@Body() body: any) {
    return this.request('block_numbers/create', 'POST', body);
  }

  @Post('blocknumbers/update')
  async blocknumbersUpdate(@Body() body: any) {
    return this.request('block_numbers/update', 'POST', body);
  }

  @Post('blocknumbers/delete')
  async blocknumbersDelete(@Body() body: { id: string }) {
    return this.request('block_numbers/delete', 'GET', body);
  }

  @Get('allownumbers/list')
  async allownumbersList() {
    return this.request('allow_numbers/list');
  }

  @Post('allownumbers/search')
  async allownumbersSearch(@Body() body: any) {
    return this.request('allow_numbers/search', 'POST', body);
  }

  @Post('allownumbers/get')
  async allownumbersGet(@Body() body: { id: string }) {
    return this.request('allow_numbers/get', 'POST', body);
  }

  @Post('allownumbers/query')
  async allownumbersQuery(@Body() body: { ids: string[] }) {
    return this.request('allow_numbers/query', 'POST', body);
  }

  @Post('allownumbers/create')
  async allownumbersCreate(@Body() body: any) {
    return this.request('allow_numbers/create', 'POST', body);
  }

  @Post('allownumbers/update')
  async allownumbersUpdate(@Body() body: any) {
    return this.request('allow_numbers/update', 'POST', body);
  }

  @Post('allownumbers/delete')
  async allownumbersDelete(@Body() body: { id: string }) {
    return this.request('allow_numbers/delete', 'GET', body);
  }
}