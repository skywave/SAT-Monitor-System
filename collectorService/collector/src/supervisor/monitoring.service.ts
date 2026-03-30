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
    }, 5000);
  }

  /**
   * Get latest latency for an IP from network_monitoring table
   */
  private async getLatencyForIP(ip: string): Promise<number | undefined> {
    try {
      const result = await this.networkMonitoringRepo.findOne({
        where: { ip_address: ip },
        order: { timestamp: 'DESC' },
      });
      return result?.latency_ms || undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Get latest bandwidth for a trunk from bandwidth_monitoring table
   */
  private async getBandwidthForTrunk(trunkId: string): Promise<{ in: number; out: number } | undefined> {
    try {
      const result = await this.bandwidthMonitoringRepo.findOne({
        where: { trunk_id: trunkId },
        order: { timestamp: 'DESC' },
      });
      
      if (result) {
        return {
          in: result.bandwidth_in_mbps || 0,
          out: result.bandwidth_out_mbps || 0,
        };
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * Write trunk status to database
   */
  private async writeTrunkStatuses(trunks: any[]): Promise<void> {
    for (const trunk of trunks) {
      try {
        const trunkId = String(trunk.id);
        const trunkName = trunk.name;
        const status = trunk.status || 1;
        const previousState = this.previousTrunkStates.get(trunkId);

        // Extract IP from host_port
        let destinationIp = 'unknown';
        let destinationPort = '5060';

        if (trunk.host_port) {
          const parts = trunk.host_port.split(':');
          destinationIp = parts[0];
          destinationPort = parts[1] || '5060';
        }

        // Determine source/destination type
        let sourceType = 'PBX';
        let destinationType = 'Unknown';

        if (trunk.type === 'peer') {
          sourceType = 'PBX';
          destinationType = 'SBC';
        } else if (trunk.type === 'register') {
          sourceType = 'PBX';
          const nameLower = trunkName.toLowerCase();
          if (nameLower.includes('mtn')) {
            destinationType = 'MNO-MTN';
          } else if (nameLower.includes('airtel')) {
            destinationType = 'MNO-Airtel';
          } else if (nameLower.includes('zamtel')) {
            destinationType = 'MNO-Zamtel';
          } else if (nameLower.includes('vapi')) {
            destinationType = 'VAPI-Gateway';
          } else if (nameLower.includes('pbx') || nameLower.includes('cloudpbx')) {
            destinationType = 'PBX-Peer';
          } else {
            destinationType = 'SIP-Gateway';
          }
        } else if (trunk.type === 'webtrunk') {
          sourceType = 'PBX';
          destinationType = 'WebRTC-Gateway';
        }

        // Get latency and bandwidth from monitoring tables
        const latency = await this.getLatencyForIP(destinationIp);
        const bandwidth = await this.getBandwidthForTrunk(trunkId);

        // Status change detection
        const statusChanged = previousState?.status !== status;
        const statusChangedAt = statusChanged ? new Date() : (previousState?.status_changed_at || new Date());

        // Calculate uptime/downtime
        let uptimeSeconds = previousState?.uptime_seconds || 0;
        let downtimeSeconds = previousState?.downtime_seconds || 0;

        if (previousState) {
          const timeDiff = Math.floor((Date.now() - new Date(previousState.last_checked).getTime()) / 1000);
          if (status === 1) {
            uptimeSeconds += timeDiff;
          } else {
            downtimeSeconds += timeDiff;
          }
        }

        const entity: DeepPartial<TrunkMonitoringEntity> = {
          pbx_id: 'pbx-labs1',
          trunk_id: trunkId,
          trunk_name: trunkName,
          peer_name: trunk.username || trunkName,
          source_type: sourceType,
          destination_type: destinationType,
          source_ip: 'labs1.ras.yeastar.com',
          destination_ip: destinationIp,
          status,
          status_text: this.getTrunkStatusText(status),
          protocol: 'SIP',
          codec: 'G.711',
          current_bandwidth_in: bandwidth?.in,  // ✅ Now populated from bandwidth_monitoring
          current_bandwidth_out: bandwidth?.out,  // ✅ Now populated from bandwidth_monitoring
          current_latency_ms: latency,  // ✅ Now populated from network_monitoring
          active_calls: this.getActiveCalls(trunkId),
          ip_reachability: status === 1,
          status_changed_at: statusChangedAt,
          uptime_seconds: uptimeSeconds,
          downtime_seconds: downtimeSeconds,
          last_checked: new Date(),
          mno_info: this.getMNOInfo(trunkName),  // ✅ Now populated
          devices_connected: undefined,
          notes: undefined,
        };

        await this.trunkMonitoringRepo.save(entity);

        this.previousTrunkStates.set(trunkId, {
          status,
          status_changed_at: statusChangedAt,
          last_checked: new Date(),
          uptime_seconds: uptimeSeconds,
          downtime_seconds: downtimeSeconds,
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

  private getActiveCalls(trunkId: string): number {
    return this.callsCache.filter((call: any) => {
      const members = call.members || [];
      const inbound = members.find((m: any) => m.inbound);
      const outbound = members.find((m: any) => m.outbound);
      const trunkName = inbound?.inbound?.trunk_name || outbound?.outbound?.trunk_name;
      return trunkName && trunkName.includes(trunkId);
    }).length;
  }

  private getMNOInfo(trunkName: string): any {
    const name = trunkName.toLowerCase();
    if (name.includes('mtn')) {
      return { name: 'MTN', carrier: 'mtn', country: 'Zambia' };
    }
    if (name.includes('airtel')) {
      return { name: 'Airtel', carrier: 'airtel', country: 'Zambia' };
    }
    if (name.includes('zamtel')) {
      return { name: 'Zamtel', carrier: 'zamtel', country: 'Zambia' };
    }
    return null;
  }

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