// src/endpoints/system.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/system')
export class SystemController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  @Get('capacity')
  async capacity() {
    return this.request('system/capacity');
  }

  @Get('menuoptions')
  async menuOptions() {
    return this.request('system/get_menuoptions');
  }

  @Post('sendemail')
  async sendEmail(@Body() body: { to: string; subject: string; content: string }) {
    return this.request('system/sendemail', 'POST', body);
  }
}