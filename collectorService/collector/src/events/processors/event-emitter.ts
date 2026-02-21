// src/events/processors/event-emitter.ts

import { Injectable, Logger } from '@nestjs/common';
import { NormalizedEvent } from './event-normalizer';

/**
 * Emits events to external systems (Gateway, message bus, etc.)
 */
@Injectable()
export class EventEmitter {
  private readonly logger = new Logger(EventEmitter.name);

  constructor(
    // TODO: Inject transport service (Redis, RabbitMQ, HTTP, etc.)
    // private readonly transport: TransportService
  ) {}

  /**
   * Emit event to Gateway service
   */
  async emit(event: NormalizedEvent): Promise<void> {
    try {
      // TODO: Implement actual transport (Redis pub/sub, HTTP POST, etc.)
      this.logger.log(
        `📡 Emitting event: ${event.eventType} - ` +
        `${event.resource.type}/${event.resource.name}`
      );

      // Example: Redis pub/sub
      // await this.transport.publish('pbx.events', {
      //   event_type: event.eventType,
      //   pbx_id: event.pbxId,
      //   resource: event.resource,
      //   data: event.data,
      //   timestamp: event.timestamp,
      // });

      // Example: HTTP POST to Gateway
      // await this.transport.post('http://gateway:3001/events', event);

    } catch (error) {
      this.logger.error(`Failed to emit event: ${error.message}`);
    }
  }

  /**
   * Emit critical alert (trunk down, etc.)
   */
  async emitAlert(event: NormalizedEvent): Promise<void> {
    try {
      // Check if this is a critical event
      const isCritical = this.isCriticalEvent(event);

      if (isCritical) {
        this.logger.warn(
          `🚨 CRITICAL: ${event.resource.type}/${event.resource.name} - ` +
          `${event.data.status_text}`
        );

        // TODO: Send to alerting channel (separate from normal events)
        // await this.transport.publish('pbx.alerts', event);
      }
    } catch (error) {
      this.logger.error(`Failed to emit alert: ${error.message}`);
    }
  }

  /**
   * Determine if event is critical
   */
  private isCriticalEvent(event: NormalizedEvent): boolean {
    if (event.eventType === 'trunk_status_changed') {
      const criticalStatuses = [41, 42, 43]; // Registration failed, unreachable, unavailable
      return criticalStatuses.includes(event.data.status);
    }
    return false;
  }
}