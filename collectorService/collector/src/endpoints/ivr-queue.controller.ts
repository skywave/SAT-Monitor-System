// src/endpoints/ivr-queue.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api')
export class IvrQueueController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  // IVR
  @Get('ivr/list')
  async ivrList() {
    return this.request('ivr/list');
  }

  @Post('ivr/search')
  async ivrSearch(@Body() body: { name?: string }) {
    return this.request('ivr/search', 'POST', body);
  }

  @Post('ivr/get')
  async ivrGet(@Body() body: { id: string }) {
    return this.request('ivr/get', 'POST', body);
  }

  @Post('ivr/query')
  async ivrQuery(@Body() body: { ids: string[] }) {
    return this.request('ivr/query', 'POST', body);
  }

  @Post('ivr/create')
  async ivrCreate(@Body() body: any) {
    return this.request('ivr/create', 'POST', body);
  }

  @Post('ivr/update')
  async ivrUpdate(@Body() body: any) {
    return this.request('ivr/update', 'POST', body);
  }

  @Post('ivr/delete')
  async ivrDelete(@Body() body: { id: string }) {
    return this.request('ivr/delete', 'GET', body);
  }

  // Queue
  @Get('queue/list')
  async queueList() {
    return this.request('queue/list');
  }

  @Post('queue/search')
  async queueSearch(@Body() body: { name?: string }) {
    return this.request('queue/search', 'POST', body);
  }

  @Post('queue/get')
  async queueGet(@Body() body: { id: string }) {
    return this.request('queue/get', 'POST', body);
  }

  @Post('queue/query')
  async queueQuery(@Body() body: { ids: string[] }) {
    return this.request('queue/query', 'POST', body);
  }

  @Post('queue/create')
  async queueCreate(@Body() body: any) {
    return this.request('queue/create', 'POST', body);
  }

  @Post('queue/update')
  async queueUpdate(@Body() body: any) {
    return this.request('queue/update', 'POST', body);
  }

  @Post('queue/delete')
  async queueDelete(@Body() body: { id: string }) {
    return this.request('queue/delete', 'GET', body);
  }

  @Post('queue/call_status')
  async queueCallStatus(@Body() body: { queue_id: string }) {
    return this.request('queue/call_status', 'POST', body);
  }

  @Post('queue/agent_status')
  async queueAgentStatus(@Body() body: { queue_id: string }) {
    return this.request('queue/agent_status', 'POST', body);
  }

  @Get('queue/pause_reason/list')
  async queuePauseReasonList() {
    return this.request('queue_pause_reason/list');
  }

  @Post('queue/pause_reason/update')
  async queuePauseReasonUpdate(@Body() body: any) {
    return this.request('queue_pause_reason/update', 'POST', body);
  }

  @Get('queue/option/get')
  async queueOptionGet() {
    return this.request('queue_option/get');
  }

  @Post('queue/option/update')
  async queueOptionUpdate(@Body() body: any) {
    return this.request('queue_option/update', 'POST', body);
  }

  @Post('queue/honor_wrapup_time')
  async queueHonorWrapupTime(@Body() body: { enable: boolean }) {
    return this.request('queue/honor_wrapup_time', 'POST', body);
  }

  @Post('queue/agent_login')
  async queueAgentLogin(@Body() body: any) {
    return this.request('queue/agent_login', 'GET', body);
  }

  @Post('queue/agent_pause')
  async queueAgentPause(@Body() body: any) {
    return this.request('queue/agent_pause', 'GET', body);
  }

  @Post('agent/login')
  async agentLogin(@Body() body: any) {
    return this.request('agent/login', 'GET', body);
  }

  @Post('agent/pause')
  async agentPause(@Body() body: any) {
    return this.request('agent/pause', 'GET', body);
  }
}