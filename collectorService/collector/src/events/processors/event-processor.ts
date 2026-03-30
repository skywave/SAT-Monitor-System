// src/events/processors/event-processor.ts
import { Injectable, Logger } from '@nestjs/common';
import { EventNormalizer, NormalizedEvent } from './event-normalizer';
import { StateTracker } from './state-tracker';
import { EventLogger } from './event.logger';
import { EventEmitter } from './event-emitter';
import { YeastarEvent } from '../types/event.types';

/**
 * Main event processing pipeline
 * Coordinates normalization, state tracking, persistence, and emission
 */
@Injectable()
export class EventProcessor {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(
    private readonly normalizer: EventNormalizer,
    private readonly stateTracker: StateTracker,
    private readonly eventLogger: EventLogger,
    private readonly eventEmitter: EventEmitter,
  ) {}

  /**
   * Process a raw event from WebSocket
   */
  async process(rawEvent: YeastarEvent & { pbxId: string }): Promise<void> {
    try {
      // Step 1: Normalize
      const normalized = this.normalizer.normalize(rawEvent);
      if (!normalized) {
        return; // Normalization failed or unsupported event type
      }

      this.logger.log(
        `Processing: ${normalized.eventType} - ` +
        `${normalized.resource.type}/${normalized.resource.name}`
      );

      // Step 2: Check if state changed
      const shouldEmit = this.stateTracker.shouldEmit(normalized);

      // Step 3: Always log raw event
      await this.eventLogger.log(normalized);

      // Step 4: Dispatch to specific handlers
      await this.dispatchToHandlers(normalized);

      // Step 5: Only emit if state changed
      if (shouldEmit) {
        // Emit to Gateway
        await this.eventEmitter.emit(normalized);

        // Check for critical alerts
        await this.eventEmitter.emitAlert(normalized);
      }
    } catch (error) {
      this.logger.error(`Failed to process event: ${error.message}`);
    }
  }

  /**
   * Dispatch event to specific type handlers
   */
  private async dispatchToHandlers(event: NormalizedEvent): Promise<void> {
    // Handler dispatch logic can be added here
    // For now, events are logged via EventLogger
    this.logger.debug(`Dispatched ${event.eventType} to handlers`);
  }
}