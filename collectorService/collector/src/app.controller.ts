import { Controller, Get } from '@nestjs/common';
import { PBXManager } from './pbx/pbx.manager';

/**
 * General API controller exposing PBX endpoints for testing and development.
 * Routes are grouped under /api/test for Postman or internal testing.
 */
@Controller('api')
export class ApiController {
  constructor(private readonly pbxManager: PBXManager) {}

  /**
   * Helper function to get PBX instance.
   * Ensures all requests have a valid PBX instance.
   */
  private getInstance(instanceName = 'pbx-labs1') {
    const instance = this.pbxManager.getInstance(instanceName);
    if (!instance) throw new Error(`PBX instance "${instanceName}" not found`);
    return instance;
  }

  /**
   * Generic function to wrap PBX API requests.
   * @param endpoint PBX API endpoint, e.g., 'trunk/list'
   * @param method HTTP method, default GET
   * @param body Optional request payload
   */
  private async requestPBX(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) {
    const instance = this.getInstance();
    return instance.request(endpoint, method, body);
  }

  // =======================
  // PBX Test Endpoints
  // =======================

  @Get('test/trunks')
  async testTrunks() {
    return this.requestPBX('trunk/list');
  }

  @Get('test/extensions')
  async testExtensions() {
    return this.requestPBX('extension/list');
  }

  @Get('test/contacts')
  async testContact() {
    return this.requestPBX('company_contact/list');
  }

  @Get('test/phonebook')
  async testPhonebook() {
    return this.requestPBX('phonebook/list');
  }

  @Get('test/status')
  async testStatus() {
    return this.requestPBX('system/information');
  }

  @Get('test/inboundroutes')
  async testInboundRoute() {
    return this.requestPBX('inbound_route/list');
  }

  @Get('test/queues')
  async testQueues() {
    return this.requestPBX('queue/list');
  }

  @Get('test/outboundroutes')
  async testOutboundRoute() {
    return this.requestPBX('outbound_route/list');
  }

  @Get('test/ringgroups')
  async testRingGroups() {
    return this.requestPBX('ring_group/list');
  }

  @Get('test/conferences')
  async testConferences() {
    return this.requestPBX('conference/list');
  }

  @Get('test/inbound_routes')
  async testInboundRoutes() {
    return this.requestPBX('inbound_route/list');
  }

  @Get('test/outbound_routes')
  async testOutboundRoutes() {
    return this.requestPBX('outbound_route/list');
  }

  @Get('test/voicemails')
  async testVoicemails() {
    return this.requestPBX('vm/query', 'POST', { page: 1, page_size: 20 });
  }

  @Get('test/ivr')
  async testIVR() {
    return this.requestPBX('ivr/list');
  }

  @Get('test/paging')
  async testPaging() {
    return this.requestPBX('paging/list');
  }

  @Get('test/phonebooks')
  async testPhonebooks() {
    return this.requestPBX('phonebook/list');
  }

  @Get('test/contacts')
  async testContacts() {
    return this.requestPBX('company_contact/list');
  }

  @Get('test/organizations')
  async testOrganizations() {
    return this.requestPBX('organization/list');
  }

  @Get('test/ivrs')
  async testIVRs() {
    return this.requestPBX('ivr/list');
  }

  @Get('test/pinlists')
  async testPinLists() {
    return this.requestPBX('pin_list/list');
  }

  @Get('test/blocknumbers')
  async testBlockNumbers() {
    return this.requestPBX('block_numbers/list');
  }

  @Get('test/allownumbers')
  async testAllowNumbers() {
    return this.requestPBX('allow_numbers/list');
  }

  @Get('test/messagechannels')
  async testMessageChannels() {
    return this.requestPBX('message_channel/list');
  }

  @Get('test/messagequeues')
  async testMessageQueues() {
    return this.requestPBX('message_queue/list');
  }

  @Get('test/messagecampaigns')
  async testMessageCampaigns() {
    return this.requestPBX('message_campaign/list');
  }

  @Get('test/messagesessions')
  async testMessageSessions() {
    return this.requestPBX('message_session/list');
  }

  @Get('test/storage')
  async testStorage() {
    return this.requestPBX('storage/list');
  }

  @Get('test/backups')
  async testBackups() {
    return this.requestPBX('backup/list');
  }

  @Get('test/systemlogs')
  async testSystemLogs() {
    return this.requestPBX('system_log/list');
  }

  @Get('test/recordings')
  async testRecordings() {
    return this.requestPBX('recording/list');
  }

  @Get('test/cdrs')
  async testCDRs() {
    return this.requestPBX('cdr/list');
  }

  @Get('test/callreports')
  async testCallReports() {
    return this.requestPBX('call_report/list');
  }

  @Get('test/scheduledcallreports')
  async testScheduledCallReports() {
    return this.requestPBX('call_schedule_report/list');
  }

  @Get('test/wakeupcalls')
  async testWakeupCalls() {
    return this.requestPBX('wakeupcall/list');
  }

  @Get('test/extensionstatusmonitor')
  async testExtensionStatusMonitor() {
    return this.requestPBX('extension_status_monitor/list');
  }

  @Get('test/trunkstatusmonitor')
  async testTrunkStatusMonitor() {
    return this.requestPBX('trunk_status_monitor/list');
  }

  @Get('test/queuepausereasons')
  async testQueuePauseReasons() {
    return this.requestPBX('queue_pause_reason/list');
  }
}
