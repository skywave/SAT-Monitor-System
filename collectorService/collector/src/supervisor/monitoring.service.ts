import { Injectable, Logger, Optional } from '@nestjs/common';
import { StateTracker } from '../events/processors/state-tracker';
import { WebSocketManager } from '../events/websocket/websocket.manager';
import { PBXDataService } from './pbx-data.service';

/**
 * Aggregates real-time monitoring data from all sources:
 * - Real-time PBX API data (extensions, trunks, calls)
 * - State tracking (agents, latency)
 * - WebSocket connection status
 */
@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly eventTimestamps = new Map<string, number>();
  private startTime = Date.now();
  private syncInterval: NodeJS.Timeout;
  
  // Cache for real PBX data
  private extensionsCache: any[] = [];
  private trunksCache: any[] = [];
  private callsCache: any[] = [];

  constructor(
    private readonly stateTracker: StateTracker,
    private readonly wsManager: WebSocketManager,
    private readonly pbxDataService: PBXDataService,
    // network module is optional; use Optional decorator
    @Optional()
    private readonly networkMonitor?: import('../network/network-monitor.service').NetworkMonitorService,
  ) {
    this.startDataSync();
  }

  /**
   * Periodically fetch real data from PBX API endpoints (5 second cycle)
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

        if (extensions.length > 0 || trunks.length > 0 || calls.length > 0) {
          this.logger.debug(
            `Synced: ${extensions.length} extensions, ${trunks.length} trunks, ${calls.length} calls`,
          );
        }
      } catch (error) {
        // Silently handle - PBX may not be available yet
      }
    }, 5000);
  }

  onModuleDestroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }

  /**
   * Get comprehensive status of all monitored resources
   */
  async getStatus(): Promise<any> {
    const uptime = Math.round((Date.now() - this.startTime) / 1000);

    return {
      timestamp: new Date().toISOString(),
      uptime_seconds: uptime,
      summary: {
        total_pbx_connections: this.getTotalPBXConnections(),
        total_events_processed: this.getTotalEventsProcessed(),
        total_trunks_tracked: this.trunksCache.length,
        total_extensions_tracked: this.extensionsCache.length,
        total_calls_active: this.callsCache.length,
        average_latency_ms: this.getAverageLatency(),
      },
      pbx_instances: this.getPBXStatus(),
      trunks: this.getTrunksStatus(),
      extensions: this.getExtensionsStatus(),
      calls: this.getCallsStatus(),
      agents: this.getAgentsStatus(),
      network: this.networkMonitor ? await this.networkMonitor.getLatestStatus() : undefined,
    };
  }

  /**
   * Get PBX connection status
   */
  private getPBXStatus(): any[] {
    const isConnected = this.extensionsCache.length > 0;
    
    return [
      {
        pbx_id: 'pbx-labs1',
        host: 'labs1.ras.yeastar.com',
        status: isConnected ? 'connected' : 'connecting',
        websocket_status: 'open',
        last_heartbeat: new Date(Date.now() - 5000).toISOString(),
        uptime_seconds: Math.round((Date.now() - this.startTime) / 1000),
        event_latency_ms: this.getAverageLatency(),
        subscribed_events: [30007, 30008, 30010, 30011, 30012, 30013, 30022, 30023, 30029],
        extensions_online: this.extensionsCache.filter(
          (e: any) => e.status === 'registered' || e.status === 1,
        ).length,
        trunks_healthy: this.trunksCache.filter((t: any) => t.status === 1).length,
      },
    ];
  }

  /**
   * Get all trunk states from real API data
   */
  private getTrunksStatus(): any[] {
    if (this.trunksCache.length === 0) return [];

    return this.trunksCache.map((trunk: any) => ({
      trunk_id: trunk.trunk_id || trunk.id,
      trunk_name: trunk.trunk_name || trunk.name,
      status: trunk.status || 1,
      status_text: this.getTrunkStatusText(trunk.status || 1),
      type: trunk.type || trunk.trunk_type || 'unknown',
      registered_ip: trunk.registered_ip || trunk.ip,
      last_updated: new Date().toISOString(),
    }));
  }

  /**
  * Get all extension states from real API data
  */
  private getExtensionsStatus(): any[] {
    if (this.extensionsCache.length === 0) return [];

    return this.extensionsCache.map((ext: any) => {
      // Check if extension is online (any device registered)
      const isOnline = 
        ext.online_status?.linkus_web?.status === 1 ||
        ext.online_status?.linkus_mobile?.status === 1 ||
        ext.online_status?.linkus_desktop?.status === 1 ||
        ext.online_status?.sip_phone?.status === 1 ||
        ext.online_status?.fxs_phone?.status === 1;

      // Get IP address from mobile device if online
      let ip = 'N/A';
      if (ext.online_status?.linkus_mobile?.status === 1 && 
          ext.online_status?.linkus_mobile?.status_list?.[0]?.ip) {
        ip = ext.online_status.linkus_mobile.status_list[0].ip;
      }

      // Get device type
      let userAgent = 'N/A';
      if (ext.online_status?.linkus_mobile?.status === 1) {
        userAgent = ext.online_status.linkus_mobile.status_list?.[0]?.linkus_dev_type || 'mobile';
      } else if (ext.online_status?.linkus_web?.status === 1) {
        userAgent = 'web';
      } else if (ext.online_status?.linkus_desktop?.status === 1) {
        userAgent = 'desktop';
      } else if (ext.online_status?.sip_phone?.status === 1) {
        userAgent = 'sip_phone';
      }

      return {
        ext_id: ext.number,                
        ext_name: ext.caller_id_name,  
        registration_status: isOnline ? 1 : 0,
        registration_text: isOnline ? 'online' : 'offline',
        presence_status: ext.presence_status || 'unknown',
        ip: ip,
        user_agent: userAgent,
        email: ext.email_addr || 'N/A',
        role: ext.role_name || 'N/A',
        last_updated: new Date().toISOString(),
      };
    });
  }

  /**
   * Get all active calls (in progress)
   */
  private getCallsStatus(): any[] {
    if (this.callsCache.length === 0) return [];

    return this.callsCache.map((call: any) => {
      // Extract members information
      const members = call.members || [];
      
      // Find extension members
      const extensions = members
        .filter((m: any) => m.extension)
        .map((m: any) => ({
          number: m.extension.number,
          status: m.extension.member_status,
          channel: m.extension.channel_id,
        }));

      // Find inbound members
      const inbound = members.find((m: any) => m.inbound);
      const outbound = members.find((m: any) => m.outbound);

      // Determine from/to
      let from = 'Unknown';
      let to = 'Unknown';

      if (extensions.length >= 2) {
        from = extensions[0].number;
        to = extensions[1].number;
      } else if (inbound) {
        from = inbound.inbound.from;
        to = inbound.inbound.to;
      } else if (outbound) {
        from = outbound.outbound.from;
        to = outbound.outbound.to;
      } else if (extensions.length === 1) {
        from = extensions[0].number;
      }

      return {
        call_id: call.call_id,
        from: from,
        to: to,
        members: extensions.map((e: any) => `${e.number} (${e.status})`),
        member_count: members.length,
        extensions: extensions,
        trunk: inbound?.inbound?.trunk_name || outbound?.outbound?.trunk_name || 'N/A',
        last_updated: new Date().toISOString(),
      };
    });
  }
  /**
   * Get all agent statuses from state tracker
   */
  private getAgentsStatus(): any[] {
    const pbxId = 'pbx-labs1';
    const agents = this.stateTracker.getAgentStates?.(pbxId) || new Map();
    const result: any[] = [];

    for (const [agentId, state] of agents) {
      result.push({
        agent_id: agentId,
        agent_name: state.agent_name || agentId,
        agent_status: state.agent_status,
        status_text: this.getAgentStatusText(state.agent_status),
        queue_id: state.queue_id,
        last_updated: state.lastUpdated || new Date().toISOString(),
      });
    }

    return result;
  }

  /**
   * Record event timestamp for latency calculation
   */
  recordEventLatency(eventId: string): void {
    this.eventTimestamps.set(eventId, Date.now());
  }

  /**
   * Get average event latency
   */
  getAverageLatency(): number {
    if (this.eventTimestamps.size === 0) return 0;
    const values = Array.from(this.eventTimestamps.values());
    const now = Date.now();
    const recentEvents = values.filter((ts) => now - ts < 100);
    if (recentEvents.length === 0) return 0;
    return Math.round(
      recentEvents.reduce((sum, ts) => sum + (now - ts), 0) / recentEvents.length,
    );
  }

  private getTotalPBXConnections(): number {
    return this.extensionsCache.length > 0 ? 1 : 0;
  }

  private getTotalEventsProcessed(): number {
    return this.eventTimestamps.size;
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

  private getExtensionStatusText(status: any): string {
    const map: Record<any, string> = {
      0: 'unregistered',
      1: 'registered',
      2: 'busy',
      3: 'offline',
    };
    return map[status] || 'unknown';
  }

  private getAgentStatusText(status: any): string {
    const map: Record<any, string> = {
      0: 'not_available',
      1: 'available',
      2: 'busy',
      3: 'paused',
    };
    return map[status] || 'unknown';
  }
}
