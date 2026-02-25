// src/endpoints/recording-cdr.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api')
export class RecordingCdrController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  // Recording
  @Get('recording/list')
  async recordingList() {
    return this.request('recording/list');
  }

  @Post('recording/search')
  async recordingSearch(@Body() body: any) {
    return this.request('recording/search', 'POST', body);
  }

  @Post('recording/download')
  async recordingDownload(@Body() body: { id: string }) {
    return this.request('recording/download', 'POST', body);
  }

  @Post('recording/playtoextension')
  async recordingPlayToExtension(@Body() body: { id: string; extension_id: string }) {
    return this.request('recording/playtoextension', 'POST', body);
  }

  // Auto Recording
  @Get('autorecord/get')
  async autorecordGet() {
    return this.request('autorecord/get');
  }

  @Post('autorecord/update')
  async autorecordUpdate(@Body() body: any) {
    return this.request('autorecord/update', 'POST', body);
  }

  // CDR
  @Get('cdr/list')
  async cdrList() {
    return this.request('cdr/list');
  }

  @Post('cdr/search')
  async cdrSearch(@Body() body: any) {
    return this.request('cdr/search', 'POST', body);
  }

  @Post('cdr/download')
  async cdrDownload(@Body() body: any) {
    return this.request('cdr/download', 'POST', body);
  }

  @Get('cdr/getoption')
  async cdrGetOption() {
    return this.request('cdr/getoption');
  }

  @Post('cdr/updateoption')
  async cdrUpdateOption(@Body() body: any) {
    return this.request('cdr/updateoption', 'POST', body);
  }

  // Call Reports
  @Post('callreport/list')
  async callReportList(@Body() body?: any) {
    return this.request('call_report/list', 'POST', body);
  }

  @Post('callreport/detail')
  async callReportDetail(@Body() body: any) {
    return this.request('call_report/detail', 'POST', body);
  }

  @Post('callreport/download')
  async callReportDownload(@Body() body: any) {
    return this.request('call_report/download', 'POST', body);
  }

  @Get('callreport/schedule/list')
  async callScheduleReportList() {
    return this.request('call_schedule_report/list');
  }

  @Post('callreport/schedule/download')
  async callScheduleReportDownload(@Body() body: { id: string }) {
    return this.request('call_schedule_report/download', 'POST', body);
  }
}