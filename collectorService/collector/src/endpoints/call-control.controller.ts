// src/endpoints/call-control.controller.ts
import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/call')
export class CallControlController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  @Get('query')
  async query(@Query() query?: any) {
    return this.request('call/query', 'GET', query);
  }

  @Post('dial')
  async dial(@Body() body: { caller: string; callee: string }) {
    return this.request('call/dial', 'POST', body);
  }

  @Post('accept_inbound')
  async acceptInbound(@Body() body: { call_id: string }) {
    return this.request('call/accept_inbound', 'POST', body);
  }

  @Post('refuse_inbound')
  async refuseInbound(@Body() body: { call_id: string }) {
    return this.request('call/refuse_inbound', 'POST', body);
  }

  @Post('listen')
  async listen(@Body() body: any) {
    return this.request('call/listen', 'POST', body);
  }

  @Post('hold')
  async hold(@Body() body: { call_id: string }) {
    return this.request('call/hold', 'POST', body);
  }

  @Post('unhold')
  async unhold(@Body() body: { call_id: string }) {
    return this.request('call/unhold', 'POST', body);
  }

  @Post('mute')
  async mute(@Body() body: { call_id: string }) {
    return this.request('call/mute', 'POST', body);
  }

  @Post('unmute')
  async unmute(@Body() body: { call_id: string }) {
    return this.request('call/unmute', 'POST', body);
  }

  @Post('park')
  async park(@Body() body: { call_id: string }) {
    return this.request('call/park', 'POST', body);
  }

  @Get('park_status')
  async parkStatus() {
    return this.request('call/park_status');
  }

  @Post('forward_to_voicemail')
  async forwardToVoicemail(@Body() body: any) {
    return this.request('call/directly_forward_to_voicemail', 'POST', body);
  }

  @Post('transfer')
  async transfer(@Body() body: any) {
    return this.request('call/transfer', 'POST', body);
  }

  @Post('add_member')
  async addMember(@Body() body: any) {
    return this.request('call/add_member', 'POST', body);
  }

  @Post('play_prompt')
  async playPrompt(@Body() body: any) {
    return this.request('call/play_prompt', 'POST', body);
  }

  @Post('hangup')
  async hangup(@Body() body: { call_id: string }) {
    return this.request('call/hangup', 'POST', body);
  }

  @Post('record_start')
  async recordStart(@Body() body: { call_id: string }) {
    return this.request('call/record_start', 'POST', body);
  }

  @Post('record_pause')
  async recordPause(@Body() body: { call_id: string }) {
    return this.request('call/record_pause', 'POST', body);
  }

  @Post('record_unpause')
  async recordUnpause(@Body() body: { call_id: string }) {
    return this.request('call/record_unpause', 'POST', body);
  }

  // uaCSTA
  @Post('uacsta/accept')
  async uacstaAccept(@Body() body: any) {
    return this.request('uacsta_call/accept', 'POST', body);
  }

  @Post('uacsta/refuse')
  async uacstaRefuse(@Body() body: any) {
    return this.request('uacsta_call/refuse', 'POST', body);
  }

  @Post('uacsta/hangup')
  async uacstaHangup(@Body() body: any) {
    return this.request('uacsta_call/hangup', 'POST', body);
  }

  // Call Notes
  @Post('notes/get')
  async notesGet(@Body() body: { call_id: string }) {
    return this.request('callnotes/get', 'POST', body);
  }

  @Post('notes/update')
  async notesUpdate(@Body() body: { call_id: string; notes: string }) {
    return this.request('callnotes/update', 'POST', body);
  }
}