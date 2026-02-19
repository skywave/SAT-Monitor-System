// src/endpoints/conference.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/conference')
export class ConferenceController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  @Get('list')
  async list() {
    return this.request('conference/list');
  }

  @Post('search')
  async search(@Body() body: { name?: string }) {
    return this.request('conference/search', 'POST', body);
  }

  @Post('get')
  async get(@Body() body: { id: string }) {
    return this.request('conference/get', 'POST', body);
  }

  @Post('query')
  async query(@Body() body: { ids: string[] }) {
    return this.request('conference/query', 'POST', body);
  }

  @Get('query_interim')
  async queryInterim() {
    return this.request('query_interim_conference');
  }

  @Post('viewpassword')
  async viewPassword(@Body() body: { id: string }) {
    return this.request('conference/viewpassword', 'POST', body);
  }

  @Post('query_ongoing')
  async queryOngoing(@Body() body?: { ids?: string[] }) {
    return this.request('conference/query_ongoing_conference', 'POST', body);
  }

  @Post('create')
  async create(@Body() body: any) {
    return this.request('conference/create', 'POST', body);
  }

  @Post('start_interim')
  async startInterim(@Body() body: any) {
    return this.request('conference/start_interim_conference', 'POST', body);
  }

  @Post('invite_member')
  async inviteMember(@Body() body: any) {
    return this.request('conference/invite_member', 'POST', body);
  }

  @Post('kick_member')
  async kickMember(@Body() body: any) {
    return this.request('conference/kick_member', 'POST', body);
  }

  @Post('mute_member')
  async muteMember(@Body() body: any) {
    return this.request('conference/mute_member', 'POST', body);
  }

  @Post('unmute_member')
  async unmuteMember(@Body() body: any) {
    return this.request('conference/unmute_member', 'POST', body);
  }

  @Post('update')
  async update(@Body() body: any) {
    return this.request('conference/update', 'POST', body);
  }

  @Post('delete')
  async delete(@Body() body: { id: string }) {
    return this.request('conference/delete', 'GET', body);
  }

  // Paging
  @Get('paging/list')
  async pagingList() {
    return this.request('paging/list');
  }

  @Post('paging/search')
  async pagingSearch(@Body() body: { name?: string }) {
    return this.request('paging/search', 'POST', body);
  }

  @Post('paging/get')
  async pagingGet(@Body() body: { id: string }) {
    return this.request('paging/get', 'POST', body);
  }

  @Post('paging/query')
  async pagingQuery(@Body() body: { ids: string[] }) {
    return this.request('paging/query', 'POST', body);
  }

  @Post('paging/create')
  async pagingCreate(@Body() body: any) {
    return this.request('paging/create', 'POST', body);
  }

  @Post('paging/update')
  async pagingUpdate(@Body() body: any) {
    return this.request('paging/update', 'POST', body);
  }

  @Post('paging/delete')
  async pagingDelete(@Body() body: { id: string }) {
    return this.request('paging/delete', 'GET', body);
  }
}