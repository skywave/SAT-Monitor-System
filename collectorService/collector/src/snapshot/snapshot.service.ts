/**
 * snapshot.service.ts
 *
 * Cached snapshot of Yeastar data (trunks + CDR + system info).
 * Mirrors the retired plain-Node Collector (port 3001) so the
 * NotificationSystem can consume the same contract from this service.
 *
 * Status decoding matches Collector/yeastarClient.js exactly.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { PBXManager } from '../pbx/pbx.manager';

const SNAPSHOT_POLL_INTERVAL_MS = parseInt(
  process.env.SNAPSHOT_POLL_INTERVAL_MS || '120000',
  10,
);

const CDR_PAGE_SIZE = parseInt(process.env.CDR_PAGE_SIZE || '100', 10);

// Mirrors Collector/yeastarClient.js STATUS_CODES
const STATUS_CODES: Record<number, string> = {
  1: 'registered',
  2: 'busy',
  3: 'idle and unmonitored',
  4: 'registering',
  41: 'registration failed',
  42: 'trunk is unreachable',
  43: 'unavailable',
  44: 'disabled',
  45: 'authentication failed',
};

function decodeStatus(code: number): string {
  return STATUS_CODES[code] || `unknown(${code})`;
}

export interface TrunkSnapshot {
  id: any;
  trunk_id: any;
  name: any;
  type: any;
  host_port: any;
  status: string;
  raw_status: any;
}

@Injectable()
export class SnapshotService implements OnModuleInit {
  private readonly logger = new Logger(SnapshotService.name);
  private readonly instanceId = 'pbx-labs1';

  private trunks: TrunkSnapshot[] = [];
  private cdr: any[] = [];
  private systemInfo: any = null;
  private lastFetch: Date | null = null;
  private fetchCount = 0;
  private errors: { type: string; message: string; time: Date }[] = [];

  constructor(private readonly pbxManager: PBXManager) {}

  onModuleInit() {
    this.refresh();
  }

  @Interval(SNAPSHOT_POLL_INTERVAL_MS)
  async refresh(): Promise<void> {
    this.fetchCount++;
    const instance = this.pbxManager.getInstance(this.instanceId);
    if (!instance) {
      const message = `PBX instance "${this.instanceId}" not found`;
      this.logger.error(message);
      this.errors.push({ type: 'instance', message, time: new Date() });
      this.lastFetch = new Date();
      this.trimErrors();
      return;
    }

    try {
      const data = await instance.request('trunk/list');
      const list = Array.isArray(data) ? data : data.data || data.trunks || [];
      this.trunks = list.map((t: any) => ({
        id: t.id,
        trunk_id: t.id,
        name: t.name,
        type: t.type,
        host_port: t.host_port,
        status:
          typeof t.status === 'number'
            ? decodeStatus(t.status)
            : String(t.status || 'unknown'),
        raw_status: t.status,
      }));
      this.logger.log(`Snapshot trunks cached: ${this.trunks.length}`);
    } catch (err) {
      this.logger.error(`Failed to fetch trunks: ${err.message}`);
      this.errors.push({ type: 'trunks', message: err.message, time: new Date() });
    }

    try {
      const data = await instance.request('cdr/list', 'GET', undefined, {
        page: 1,
        page_size: CDR_PAGE_SIZE,
      });
      this.cdr = Array.isArray(data) ? data : data.data || data.cdr || [];
      this.logger.log(`Snapshot CDR cached: ${this.cdr.length} records`);
    } catch (err) {
      this.logger.error(`Failed to fetch CDR: ${err.message}`);
      this.errors.push({ type: 'cdr', message: err.message, time: new Date() });
    }

    try {
      this.systemInfo = await instance.request('system/information');
    } catch (err) {
      this.logger.error(`Failed to fetch system info: ${err.message}`);
    }

    this.lastFetch = new Date();
    this.trimErrors();
  }

  private trimErrors() {
    if (this.errors.length > 10) this.errors = this.errors.slice(-10);
  }

  getTrunkList(): TrunkSnapshot[] {
    return this.trunks;
  }

  getCdrList(page: number, pageSize: number): { total_number: number; data: any[] } {
    const start = (page - 1) * pageSize;
    return {
      total_number: this.cdr.length,
      data: this.cdr.slice(start, start + pageSize),
    };
  }

  getSystemInfo(): any {
    return this.systemInfo;
  }

  getHealth(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  getCacheStatus() {
    return {
      lastFetch: this.lastFetch,
      fetchCount: this.fetchCount,
      trunkCount: this.trunks.length,
      cdrCount: this.cdr.length,
      recentErrors: this.errors.slice(-5),
      intervalMs: SNAPSHOT_POLL_INTERVAL_MS,
    };
  }
}