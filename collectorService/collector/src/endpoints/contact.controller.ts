// src/endpoints/contact.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PBXManager } from '../pbx/pbx.manager';

@Controller('api/contact')
export class ContactController {
  constructor(private readonly pbxManager: PBXManager) {}

  private async request(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    const instance = this.pbxManager.getInstance('pbx-labs1');
    if (!instance) throw new Error('PBX instance not found');
    return instance.request(endpoint, method, data);
  }

  // Company Contacts
  @Get('company/list')
  async companyList() {
    return this.request('company_contact/list');
  }

  @Post('company/search')
  async companySearch(@Body() body: { name?: string }) {
    return this.request('company_contact/search', 'POST', body);
  }

  @Post('company/get')
  async companyGet(@Body() body: { id: string }) {
    return this.request('company_contact/get', 'POST', body);
  }

  @Post('company/query')
  async companyQuery(@Body() body: { ids: string[] }) {
    return this.request('company_contact/query', 'POST', body);
  }

  @Post('company/create')
  async companyCreate(@Body() body: any) {
    return this.request('company_contact/create', 'POST', body);
  }

  @Post('company/update')
  async companyUpdate(@Body() body: any) {
    return this.request('company_contact/update', 'POST', body);
  }

  @Post('company/delete')
  async companyDelete(@Body() body: { id: string }) {
    return this.request('company_contact/delete', 'GET', body);
  }

  // Phonebook
  @Get('phonebook/list')
  async phonebookList() {
    return this.request('phonebook/list');
  }

  @Post('phonebook/search')
  async phonebookSearch(@Body() body: { name?: string }) {
    return this.request('phonebook/search', 'POST', body);
  }

  @Post('phonebook/get')
  async phonebookGet(@Body() body: { id: string }) {
    return this.request('phonebook/get', 'POST', body);
  }

  @Post('phonebook/query')
  async phonebookQuery(@Body() body: { ids: string[] }) {
    return this.request('phonebook/query', 'POST', body);
  }

  @Post('phonebook/create')
  async phonebookCreate(@Body() body: any) {
    return this.request('phonebook/create', 'POST', body);
  }

  @Post('phonebook/update')
  async phonebookUpdate(@Body() body: any) {
    return this.request('phonebook/update', 'POST', body);
  }

  @Post('phonebook/delete')
  async phonebookDelete(@Body() body: { id: string }) {
    return this.request('phonebook/delete', 'GET', body);
  }
}