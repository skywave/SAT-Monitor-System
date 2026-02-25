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
        case 30010:
          return this.normalizeTrunkEvent(rawEvent, data);
        
        case 30011:
          return this.normalizeCallEvent(rawEvent, data);
        
        case 30012:
          return this.normalizeCDREvent(rawEvent, data);
        
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
}

/**
 * Normalized event structure (internal format)
 */
export interface NormalizedEvent {
  eventType: 'trunk_status_changed' | 'call_state_changed' | 'call_ended' | string;
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