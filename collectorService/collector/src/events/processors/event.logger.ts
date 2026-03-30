// src/events/processors/event-logger.ts
import { Injectable, Logger } from '@nestjs/common';
import { NormalizedEvent } from './event-normalizer';
import { EventWriter } from '../../persistence/event.writer';

/**
 * Logs events to PostgreSQL
 * This is write-only - no reads
 */
@Injectable()
export class EventLogger {
  private readonly logger = new Logger(EventLogger.name);

  constructor(
    private readonly eventWriter: EventWriter,
  ) {}

  /**
   * Write event to database
   */
  async log(event: NormalizedEvent): Promise<void> {
    try {
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
}