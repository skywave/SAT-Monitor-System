// src/events/processors/event-logger.ts

import { Injectable, Logger } from '@nestjs/common';
import { NormalizedEvent } from './event-normalizer';
import { EventWriter } from '../../persistence/event.writer';
import { StateWriter } from '../../persistence/state.writer';

/**
 * Logs events to PostgreSQL
 * This is write-only - no reads
 */
@Injectable()
export class EventLogger {
  private readonly logger = new Logger(EventLogger.name);

  constructor(
    private readonly eventWriter: EventWriter,
    private readonly stateWriter: StateWriter,
  ) {}

  /**
   * Write event to database
   */
  async log(event: NormalizedEvent): Promise<void> {
    try {
      // Persist to DB using EventWriter
      this.logger.log(
        `📝 Logging event: ${event.eventType} - ` +
        `${event.resource.type}/${event.resource.name} ` +
        `(${event.pbxId})`
      );
      await this.eventWriter.write(event);

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

      await this.stateWriter.writeStateChange(event, previousState);

    } catch (error) {
      this.logger.error(`Failed to log state change: ${error.message}`);
    }
  }
}