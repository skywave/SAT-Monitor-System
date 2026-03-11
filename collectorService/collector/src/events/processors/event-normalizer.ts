// src/events/processors/event-normalizer.ts

import { Injectable, Logger } from '@nestjs/common';
import { YeastarEvent, TrunkStatusEventData, CallStateEventData } from '../types/event.types';

/**
 * Normalizes raw Yeastar events into structured domain events
 */
@Injectable()
export class EventNormalizer {
  private readonly logger = new Logger(EventNormalizer.name);

  /**
   * Parse and normalize a Yeastar event
   */
  normalize(rawEvent: YeastarEvent & { pbxId: string }): NormalizedEvent | null {
    try {
      // Parse the msg field (it's a JSON string)
      const data = JSON.parse(rawEvent.msg);

      switch (rawEvent.type) {
        case 30007:
          return this.normalizeExtensionRegistrationEvent(rawEvent, data);
        
        case 30008:
          return this.normalizeExtensionCallEvent(rawEvent, data);
        
        case 30010:
          return this.normalizeTrunkEvent(rawEvent, data);
        
        case 30011:
          return this.normalizeCallEvent(rawEvent, data);
        
        case 30012:
          return this.normalizeCDREvent(rawEvent, data);
        
        case 30013:
          return this.normalizeCallTransferEvent(rawEvent, data);
        
        case 30022:
          return this.normalizeExtensionInfoUpdateEvent(rawEvent, data);
        
        case 30023:
          return this.normalizeTrunkInfoUpdateEvent(rawEvent, data);
        
        case 30029:
          return this.normalizeAgentStatusEvent(rawEvent, data);
        
        default:
          this.logger.warn(`Unhandled event type: ${rawEvent.type}`);
          return null;
      }
    } catch (error) {
      this.logger.error(`Failed to normalize event: ${error.message}`);
      return null;
    }
  }

  /**
   * Normalize trunk status event (30010)
   */
  private normalizeTrunkEvent(
    raw: YeastarEvent & { pbxId: string },
    data: TrunkStatusEventData
  ): NormalizedEvent {
    return {
      eventType: 'trunk_status_changed',
      eventId: raw.type,
      pbxId: raw.pbxId,
      pbxSn: raw.sn,
      timestamp: new Date(),
      resource: {
        type: 'trunk',
        id: data.trunk_name, // Yeastar uses trunk name as ID
        name: data.trunk_name,
      },
      data: {
        trunk_name: data.trunk_name,
        trunk_type: data.kind,
        status: data.status,
        status_text: this.getTrunkStatusText(data.status),
        registered_ip: data.registered_ip,
      },
      raw: raw,
    };
  }

  /**
   * Normalize call state event (30011)
   */
  private normalizeCallEvent(
    raw: YeastarEvent & { pbxId: string },
    data: CallStateEventData
  ): NormalizedEvent {
    return {
      eventType: 'call_state_changed',
      eventId: raw.type,
      pbxId: raw.pbxId,
      pbxSn: raw.sn,
      timestamp: new Date(),
      resource: {
        type: 'call',
        id: data.call_id,
        name: data.call_id,
      },
      data: {
        call_id: data.call_id,
        call_status: data.call_status,
        members: data.members,
      },
      raw: raw,
    };
  }

  /**
   * Normalize CDR event (30012)
   */
  private normalizeCDREvent(
    raw: YeastarEvent & { pbxId: string },
    data: any
  ): NormalizedEvent {
    return {
      eventType: 'call_ended',
      eventId: raw.type,
      pbxId: raw.pbxId,
      pbxSn: raw.sn,
      timestamp: new Date(),
      resource: {
        type: 'call',
        id: data.call_id || 'unknown',
        name: data.call_id || 'unknown',
      },
      data: data,
      raw: raw,
    };
  }

  /**
   * Normalize extension registration event (30007)
   */
  private normalizeExtensionRegistrationEvent(
    raw: YeastarEvent & { pbxId: string },
    data: any
  ): NormalizedEvent {
    return {
      eventType: 'extension_registration_changed',
      eventId: raw.type,
      pbxId: raw.pbxId,
      pbxSn: raw.sn,
      timestamp: new Date(),
      resource: {
        type: 'extension',
        id: data.ext_id || data.extid || '',
        name: data.ext_name || data.extname || '',
      },
      data: {
        ext_id: data.ext_id || data.extid,
        ext_name: data.ext_name || data.extname,
        registration_status: data.registration_status,
        status_text: this.getExtensionRegistrationText(data.registration_status),
        ip: data.ip,
        user_agent: data.user_agent,
      },
      raw: raw,
    };
  }

  /**
   * Normalize extension call state event (30008)
   */
  private normalizeExtensionCallEvent(
    raw: YeastarEvent & { pbxId: string },
    data: any
  ): NormalizedEvent {
    return {
      eventType: 'extension_call_state_changed',
      eventId: raw.type,
      pbxId: raw.pbxId,
      pbxSn: raw.sn,
      timestamp: new Date(),
      resource: {
        type: 'extension',
        id: data.ext_id || data.extid || '',
        name: data.ext_name || data.extname || '',
      },
      data: {
        ext_id: data.ext_id || data.extid,
        ext_name: data.ext_name || data.extname,
        call_status: data.call_status,
        call_id: data.call_id,
        members: data.members,
      },
      raw: raw,
    };
  }

  /**
   * Normalize call transfer event (30013)
   */
  private normalizeCallTransferEvent(
    raw: YeastarEvent & { pbxId: string },
    data: any
  ): NormalizedEvent {
    return {
      eventType: 'call_transferred',
      eventId: raw.type,
      pbxId: raw.pbxId,
      pbxSn: raw.sn,
      timestamp: new Date(),
      resource: {
        type: 'call',
        id: data.call_id || '',
        name: data.call_id || '',
      },
      data: {
        call_id: data.call_id,
        from: data.from,
        to: data.to,
        transferrer: data.transferrer,
      },
      raw: raw,
    };
  }

  /**
   * Normalize extension info update event (30022)
   */
  private normalizeExtensionInfoUpdateEvent(
    raw: YeastarEvent & { pbxId: string },
    data: any
  ): NormalizedEvent {
    return {
      eventType: 'extension_info_updated',
      eventId: raw.type,
      pbxId: raw.pbxId,
      pbxSn: raw.sn,
      timestamp: new Date(),
      resource: {
        type: 'extension',
        id: data.ext_id || data.extid || '',
        name: data.ext_name || data.extname || '',
      },
      data: data,
      raw: raw,
    };
  }

  /**
   * Normalize trunk info update event (30023)
   */
  private normalizeTrunkInfoUpdateEvent(
    raw: YeastarEvent & { pbxId: string },
    data: any
  ): NormalizedEvent {
    return {
      eventType: 'trunk_info_updated',
      eventId: raw.type,
      pbxId: raw.pbxId,
      pbxSn: raw.sn,
      timestamp: new Date(),
      resource: {
        type: 'trunk',
        id: data.trunk_name || '',
        name: data.trunk_name || '',
      },
      data: data,
      raw: raw,
    };
  }

  /**
   * Normalize agent status event (30029)
   */
  private normalizeAgentStatusEvent(
    raw: YeastarEvent & { pbxId: string },
    data: any
  ): NormalizedEvent {
    return {
      eventType: 'agent_status_changed',
      eventId: raw.type,
      pbxId: raw.pbxId,
      pbxSn: raw.sn,
      timestamp: new Date(),
      resource: {
        type: 'agent',
        id: data.agentid || data.agentid || '',
        name: data.agentname || data.agentname || '',
      },
      data: {
        agent_id: data.agentid,
        agent_name: data.agentname,
        agent_status: data.agent_status,
        status_text: this.getAgentStatusText(data.agent_status),
        queue_id: data.queueid,
      },
      raw: raw,
    };
  }

  /**
   * Get human-readable trunk status
   */
  private getTrunkStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      0: 'unknown',
      1: 'idle',
      2: 'busy',
      3: 'idle_unmonitored',
      4: 'registering',
      41: 'registration_failed',
      42: 'unreachable',
      43: 'unavailable',
      44: 'disabled',
    };
    return statusMap[status] || 'unknown';
  }

  /**
   * Get human-readable extension registration status
   */
  private getExtensionRegistrationText(status: any): string {
    const statusMap: Record<any, string> = {
      0: 'unregistered',
      1: 'registered',
      2: 'busy',
      3: 'offline',
    };
    return statusMap[status] || 'unknown';
  }

  /**
   * Get human-readable agent status
   */
  private getAgentStatusText(status: any): string {
    const statusMap: Record<any, string> = {
      0: 'not_available',
      1: 'available',
      2: 'busy',
      3: 'paused',
    };
    return statusMap[status] || 'unknown';
  }
}

/**
 * Normalized event structure (internal format)
 */
export interface NormalizedEvent {
  eventType: 'trunk_status_changed' | 'call_state_changed' | 'call_ended' | 'extension_registration_changed' | 'extension_call_state_changed' | 'call_transferred' | 'extension_info_updated' | 'trunk_info_updated' | 'agent_status_changed' | string;
  eventId: number;
  pbxId: string;
  pbxSn: string;
  timestamp: Date;
  resource: {
    type: 'trunk' | 'call' | string;
    id: string;
    name: string;
  };
  data: any;
  raw: YeastarEvent & { pbxId: string };
}