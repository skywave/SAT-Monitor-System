// src/endpoints/messaging.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/message')
export class MessagingController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  // Message Channels
  @Get('channel/list')
  async channelList() {
    return this.request('message_channel/list');
  }

  @Post('channel/search')
  async channelSearch(@Body() body: any) {
    return this.request('message_channel/search', 'POST', body);
  }

  @Post('channel/get')
  async channelGet(@Body() body: { id: string }) {
    return this.request('message_channel/get', 'POST', body);
  }

  @Get('channel/getlivechat')
  async channelGetLivechat() {
    return this.request('message_channel/getlivechat');
  }

  @Post('channel/query')
  async channelQuery(@Body() body: { ids: string[] }) {
    return this.request('message_channel/query', 'POST', body);
  }

  @Post('channel/whatsapp_template')
  async channelWhatsappTemplate(@Body() body: { channel_id: string }) {
    return this.request('message_channel/whatsapp_template', 'POST', body);
  }

  @Post('channel/embedcode')
  async channelEmbedcode(@Body() body: { channel_id: string }) {
    return this.request('message_channel/embedcode', 'POST', body);
  }

  @Post('channel/uploadphoto')
  async channelUploadPhoto(@Body() body: any) {
    return this.request('message_channel/uploadphoto', 'POST', body);
  }

  @Post('channel/create')
  async channelCreate(@Body() body: any) {
    return this.request('message_channel/create', 'POST', body);
  }

  @Post('channel/createlivechat')
  async channelCreateLivechat(@Body() body: any) {
    return this.request('message_channel/createlivechat', 'POST', body);
  }

  @Post('channel/update')
  async channelUpdate(@Body() body: any) {
    return this.request('message_channel/update', 'POST', body);
  }

  @Post('channel/updatelivechat')
  async channelUpdateLivechat(@Body() body: any) {
    return this.request('message_channel/updatelivechat', 'POST', body);
  }

  @Post('channel/delete')
  async channelDelete(@Body() body: { id: string }) {
    return this.request('message_channel/delete', 'GET', body);
  }

  // Message Queue
  @Get('queue/list')
  async queueList() {
    return this.request('message_queue/list');
  }

  @Post('queue/search')
  async queueSearch(@Body() body: any) {
    return this.request('message_queue/search', 'POST', body);
  }

  @Post('queue/get')
  async queueGet(@Body() body: { id: string }) {
    return this.request('message_queue/get', 'POST', body);
  }

  @Post('queue/query')
  async queueQuery(@Body() body: { ids: string[] }) {
    return this.request('message_queue/query', 'POST', body);
  }

  @Post('queue/create')
  async queueCreate(@Body() body: any) {
    return this.request('message_queue/create', 'POST', body);
  }

  @Post('queue/update')
  async queueUpdate(@Body() body: any) {
    return this.request('message_queue/update', 'POST', body);
  }

  @Post('queue/delete')
  async queueDelete(@Body() body: { id: string }) {
    return this.request('message_queues/delete', 'GET', body);
  }

  // Message Campaign
  @Get('campaign/list')
  async campaignList() {
    return this.request('message_campaign/list');
  }

  @Post('campaign/search')
  async campaignSearch(@Body() body: any) {
    return this.request('message_campaign/search', 'POST', body);
  }

  @Post('campaign/get')
  async campaignGet(@Body() body: { id: string }) {
    return this.request('message_campaign/get', 'POST', body);
  }

  @Post('campaign/query')
  async campaignQuery(@Body() body: { ids: string[] }) {
    return this.request('message_campaign/query', 'POST', body);
  }

  @Post('campaign/create')
  async campaignCreate(@Body() body: any) {
    return this.request('message_campaign/create', 'POST', body);
  }

  @Post('campaign/update')
  async campaignUpdate(@Body() body: any) {
    return this.request('message_campaign/update', 'POST', body);
  }

  @Post('campaign/retry')
  async campaignRetry(@Body() body: { id: string }) {
    return this.request('message_campaign/retry', 'GET', body);
  }

  @Post('campaign/delete')
  async campaignDelete(@Body() body: { id: string }) {
    return this.request('message_campaign/delete', 'GET', body);
  }

  // Message Session
  @Get('session/list')
  async sessionList() {
    return this.request('message_session/list');
  }

  @Post('session/search')
  async sessionSearch(@Body() body: any) {
    return this.request('message_session/search', 'POST', body);
  }

  @Post('session/get')
  async sessionGet(@Body() body: { id: string }) {
    return this.request('message_session/get', 'POST', body);
  }

  @Post('session/query')
  async sessionQuery(@Body() body: { ids: string[] }) {
    return this.request('message_session/query', 'POST', body);
  }

  @Post('session/transfer')
  async sessionTransfer(@Body() body: any) {
    return this.request('message_session/transfer', 'POST', body);
  }

  @Post('session/close')
  async sessionClose(@Body() body: { id: string }) {
    return this.request('message_session/close', 'POST', body);
  }

  @Post('session/archive')
  async sessionArchive(@Body() body: { id: string }) {
    return this.request('message_session/archive', 'POST', body);
  }

  @Post('session/unarchive')
  async sessionUnarchive(@Body() body: { id: string }) {
    return this.request('message_session/unarchive', 'POST', body);
  }

  @Post('session/delete')
  async sessionDelete(@Body() body: { id: string }) {
    return this.request('message_session/delete', 'GET', body);
  }

  // Messages
  @Post('get')
  async get(@Body() body: { session_id: string }) {
    return this.request('message/get', 'POST', body);
  }

  @Post('query')
  async query(@Body() body: { session_ids: string[] }) {
    return this.request('message/query', 'POST', body);
  }

  @Post('batchupload')
  async batchUpload(@Body() body: any) {
    return this.request('message/batchupload', 'POST', body);
  }

  @Post('send')
  async send(@Body() body: any) {
    return this.request('message/send', 'POST', body);
  }
}