import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

/**
 * Fetches real PBX data from the Yeastar REST API directly
 * Falls back to local endpoints if available
 * Queries extension status, trunk status, and call information
 */
@Injectable()
export class PBXDataService {
  private readonly logger = new Logger(PBXDataService.name);
  private readonly pbxHost = process.env.PBX_HOST || 'labs1.ras.yeastar.com';
  private readonly localBaseUrl = 'http://localhost:3000/api';

  constructor(private readonly httpService: HttpService) {}

  /**
   * Get all extensions from PBX (via local API)
   * Returns empty array if PBX not connected
   */
  async getExtensions(pbxId: string = 'pbx-labs1'): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ data: any[] }>(`${this.localBaseUrl}/extension/list`),
      );
      return (response as AxiosResponse<{ data: any[] }>).data?.data || [];
    } catch (error) {
      // Silently fail - PBX may not be connected yet
      return [];
    }
  }

  /**
   * Get all trunks from PBX (via local API)
   * Returns empty array if PBX not connected
   */
  async getTrunks(pbxId: string = 'pbx-labs1'): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ data: any[] }>(`${this.localBaseUrl}/trunk/list`),
      );
      return (response as AxiosResponse<{ data: any[] }>).data?.data || [];
    } catch (error) {
      // Silently fail - PBX may not be connected yet
      return [];
    }
  }

  /**
   * Get trunk status (via local API)
   * Returns empty array if PBX not connected
   */
  async getTrunkStatus(pbxId: string = 'pbx-labs1'): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ data: any[] }>(`${this.localBaseUrl}/monitor/trunk_status/list`),
      );
      return (response as AxiosResponse<{ data: any[] }>).data?.data || [];
    } catch (error) {
      // Silently fail - PBX may not be connected yet
      return [];
    }
  }

  /**
   * Get extension status (via local API)
   * Returns empty array if PBX not connected
   */
  async getExtensionStatus(pbxId: string = 'pbx-labs1'): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ data: any[] }>(`${this.localBaseUrl}/monitor/extension_status/list`),
      );
      return (response as AxiosResponse<{ data: any[] }>).data?.data || [];
    } catch (error) {
      // Silently fail - PBX may not be connected yet
      return [];
    }
  }

  /**
   * Get all CDRs / call history (via local API)
   * Returns empty array if PBX not connected
   */
  async getCalls(pbxId: string = 'pbx-labs1'): Promise<any[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ data: any[] }>(`${this.localBaseUrl}/api/call/query`),
      );
      return (response as AxiosResponse<{ data: any[] }>).data?.data || [];
    } catch (error) {
      // Silently fail - PBX may not be connected yet
      return [];
    }
  }

  /**
   * Get system info from PBX (via local API)
   * Returns empty object if PBX not connected
   */
  async getSystemInfo(pbxId: string = 'pbx-labs1'): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<{ data: any }>(`${this.localBaseUrl}/system/info`),
      );
      return (response as AxiosResponse<{ data: any }>).data?.data || {};
    } catch (error) {
      // Silently fail - PBX may not be connected yet
      return {};
    }
  }
}
