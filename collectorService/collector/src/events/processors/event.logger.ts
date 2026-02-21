// src/events/processors/event-logger.ts

import { Injectable, Logger } from '@nestjs/common';
import { NormalizedEvent } from './event-normalizer';

/**
 * Logs events to PostgreSQL
 * This is write-only - no reads
 */
@Injectable()
export class EventLogger {
  private readonly logger = new Logger(EventLogger.name);

  constructor(
    // TODO: Inject your database service here
    // private readonly db: DatabaseService
  ) {}

  /**
   * Write event to database
   */
  async log(event: NormalizedEvent): Promise<void> {
    try {
      // TODO: Implement actual database write
      // For now, just log to console
      this.logger.log(
        `📝 Logging event: ${event.eventType} - ` +
        `${event.resource.type}/${event.resource.name} ` +
        `(${event.pbxId})`
      );

      // Example SQL (implement with your ORM):
      // await this.db.events.insert({
      //   pbx_id: event.pbxId,
      //   pbx_sn: event.pbxSn,
      //   event_type: event.eventType,
      //   event_id: event.eventId,
      //   resource_type: event.resource.type,
      //   resource_id: event.resource.id,
      //   resource_name: event.resource.name,
      //   data: event.data,
      //   raw: event.raw,
      //   timestamp: event.timestamp,
      // });

    } catch (error) {
      this.logger.error(`Failed to log event: ${error.message}`);
    }
  }

  /**
   * Log state change specifically
   */
  async logStateChange(
    event: NormalizedEvent,
    previousState: any
  ): Promise<void> {
    try {
      this.logger.log(
        `📊 State change: ${event.resource.type}/${event.resource.name} - ` +
        `${previousState?.status_text || 'unknown'} → ${event.data.status_text}`
      );

      // TODO: Write to state_history table
      // await this.db.stateHistory.insert({
      //   pbx_id: event.pbxId,
      //   resource_type: event.resource.type,
      //   resource_id: event.resource.id,
      //   previous_state: previousState,
      //   current_state: event.data,
      //   changed_at: event.timestamp,
      // });

    } catch (error) {
      this.logger.error(`Failed to log state change: ${error.message}`);
    }
  }
}