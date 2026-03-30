// src/supervisor/monitoring.service.ts
import { Injectable, Logger, Optional, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { StateTracker } from '../events/processors/state-tracker';
import { WebSocketManager } from '../events/websocket/websocket.manager';
import { PBXDataService } from './pbx-data.service';
import { TrunkMonitoringEntity } from '../persistence/entities/trunk-monitoring.entity';
import { NetworkMonitoringEntity } from '../persistence/entities/network-monitoring.entity';
import { BandwidthMonitoringEntity } from '../persistence/entities/bandwidth-monitoring.entity';

@Injectable()
export class MonitoringService implements OnModuleDestroy {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly eventTimestamps = new Map<string, number>();
  private startTime = Date.now();
  private syncInterval: NodeJS.Timeout;

  private extensionsCache: any[] = [];
  private trunksCache: any[] = [];
  private callsCache: any[] = [];
  private previousTrunkStates = new Map<string, any>();

  constructor(
    private readonly stateTracker: StateTracker,
    private readonly wsManager: WebSocketManager,
    private readonly pbxDataService: PBXDataService,
    @InjectRepository(TrunkMonitoringEntity)
    private readonly trunkMonitoringRepo: Repository<TrunkMonitoringEntity>,
    @InjectRepository(NetworkMonitoringEntity)
    private readonly networkMonitoringRepo: Repository<NetworkMonitoringEntity>,
    @InjectRepository(BandwidthMonitoringEntity)
    private readonly bandwidthMonitoringRepo: Repository<BandwidthMonitoringEntity>,
    @Optional()
    private readonly networkMonitor?: import('../network/network-monitor.service').NetworkMonitorService,
  ) {
    this.startDataSync();
  }

  /**
   * Start data synchronization - Polls PBX every 30 seconds
   * (Reduced from 5 seconds to reduce load)
   */
  private startDataSync(): void {
    this.syncInterval = setInterval(async () => {
      try {
        const [extensions, trunks, calls] = await Promise.all([
          this.pbxDataService.getExtensions(),
          this.pbxDataService.getTrunks(),
          this.pbxDataService.getCalls(),
        ]);

        this.extensionsCache = extensions;
        this.trunksCache = trunks;
        this.callsCache = calls;

        if (trunks.length > 0) {
          await this.writeTrunkStatuses(trunks);
        }

        if (extensions.length || trunks.length || calls.length) {
          this.logger.debug(
            `Synced: ${extensions.length} extensions, ${trunks.length} trunks, ${calls.length} calls`
          );
        }
      } catch (error) {
        this.logger.error(`Data sync error: ${error.message}`);
      }
    }, 30000); // Changed from 5000 to 30000 (30 seconds)
  }

  /**
   * Write trunk status to database - SIMPLIFIED for Phase 1
   * Only writes fields that are actually available from PBX API
   */
  private async writeTrunkStatuses(trunks: any[]): Promise<void> {
    for (const trunk of trunks) {
      try {
        const trunkId = String(trunk.id);
        const trunkName = trunk.name;
        const status = trunk.status || 1;
        const previousState = this.previousTrunkStates.get(trunkId);

        // Status change detection
        const statusChanged = previousState?.status !== status;
        const statusChangedAt = statusChanged ? new Date() : (previousState?.status_changed_at || new Date());

        // SIMPLIFIED ENTITY - only what we actually have from PBX
        const entity: DeepPartial<TrunkMonitoringEntity> = {
          pbx_id: 'pbx-labs1',
          trunk_id: trunkId,
          trunk_name: trunkName,
          status: status,
          status_text: this.getTrunkStatusText(status),
          status_changed_at: statusChangedAt,
          last_checked: new Date(),
          active_calls: this.getActiveCalls(trunkId),
          protocol: trunk.protocol || 'SIP',
          codec: trunk.codec || 'G.711',
        };

        await this.trunkMonitoringRepo.save(entity);

        // Update state tracker
        this.previousTrunkStates.set(trunkId, {
          status: status,
          status_changed_at: statusChangedAt,
          last_checked: new Date(),
        });

        if (statusChanged) {
          this.logger.log(
            `📊 Trunk ${trunkName} status changed: ${this.getTrunkStatusText(previousState?.status)} → ${this.getTrunkStatusText(status)}`
          );
        }
      } catch (error) {
        this.logger.error(`Failed to write trunk ${trunk.name}: ${error.message}`);
      }
    }
  }

  /**
   * Get active calls count for a specific trunk
   */
  private getActiveCalls(trunkId: string): number {
    return this.callsCache.filter((call: any) => {
      const members = call.members || [];
      const inbound = members.find((m: any) => m.inbound);
      const outbound = members.find((m: any) => m.outbound);
      const trunkName = inbound?.inbound?.trunk_name || outbound?.outbound?.trunk_name;
      return trunkName && trunkName.includes(trunkId);
    }).length;
  }

  /**
   * Map status code to human-readable text
   */
  private getTrunkStatusText(status: number): string {
    const map: Record<number, string> = {
      1: 'idle',
      2: 'busy',
      4: 'registering',
      41: 'registration_failed',
      42: 'unreachable',
      43: 'unavailable',
      44: 'disabled',
    };
    return map[status] || 'unknown';
  }

  onModuleDestroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  /**
   * Get current system status (for health checks and monitoring)
   */
  getStatus() {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);

    const pbxInstances = [
      {
        pbx_id: 'pbx-labs1',
        host: 'labs1.ras.yeastar.com',
        status: this.wsManager.isConnected('pbx-labs1') ? 'connected' : 'disconnected',
        websocket_status: this.wsManager.isConnected('pbx-labs1') ? 'connected' : 'disconnected',
        uptime_seconds: uptimeSeconds,
        subscribed_events: this.stateTracker.getSubscribedEvents() || [],
        event_latency_ms: this.wsManager.getLatency('pbx-labs1') || 0,
      },
    ];

    const agents = this.extensionsCache
      .filter(ext => ext.is_agent)
      .map(agent => ({
        agent_id: agent.extension,
        agent_name: agent.name,
        status_text: agent.status_text || 'unknown',
        queue_id: agent.queue || 'N/A',
        last_updated: new Date(),
      }));

    const trunks = this.trunksCache.map(t => {
      const prev = this.previousTrunkStates.get(String(t.id)) || {};
      return {
        trunk_id: String(t.id),
        trunk_name: t.name,
        type: t.type,
        status: t.status,
        status_text: this.getTrunkStatusText(t.status),
        host_port: t.host_port || 'N/A',
        uptime_seconds: prev.uptime_seconds || 0,
        downtime_seconds: prev.downtime_seconds || 0,
        last_updated: prev.last_checked || new Date(),
      };
    });

    const extensions = this.extensionsCache.map(e => ({
      ext_id: e.extension,
      ext_name: e.name,
      registration_text: e.status_text || 'unknown',
      ip: e.ip || 'N/A',
      last_updated: new Date(),
    }));

    const calls = this.callsCache.map(c => ({
      call_id: c.call_id,
      duration_seconds: c.duration_seconds || 0,
      members: c.members || [],
      last_updated: new Date(),
    }));

    const latencies = pbxInstances.map(p => p.event_latency_ms || 0);
    const averageLatency = latencies.length
      ? Math.floor(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;

    return {
      uptime_seconds: uptimeSeconds,
      summary: {
        total_pbx_connections: pbxInstances.filter(p => p.status === 'connected').length,
        total_trunks_tracked: trunks.length,
        total_extensions_tracked: extensions.length,
        total_calls_active: calls.length,
        total_agents_tracked: agents.length,
      },
      average_latency: averageLatency,
      pbx_instances: pbxInstances,
      trunks,
      extensions,
      calls,
      agents,
    };
  }
}