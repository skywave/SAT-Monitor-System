// src/persistence/event.writer.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEntity } from './entities/event.entity';
import { NormalizedEvent } from '../events/processors/event-normalizer';

@Injectable()
export class EventWriter {
  private readonly logger = new Logger(EventWriter.name);

  constructor(
    @InjectRepository(EventEntity)
    private readonly repo: Repository<EventEntity>,
  ) {}

  async write(event: NormalizedEvent): Promise<void> {
    try {
      const row = this.repo.create({
        pbx_id: event.pbxId,
        event_type: event.eventType,
        related_entity_type: event.resource.type, // ✅ Updated field name
        related_entity_id: event.resource.id, // ✅ Updated field name
        description: this.buildDescription(event), // ✅ New required field
        severity: this.determineSeverity(event), // ✅ New required field
        triggered_by: 'system', // ✅ New field
        event_data: {
          // ✅ Structured event data
          resource_name: event.resource.name,
          event_id: String(event.eventId),
          pbx_sn: event.pbxSn,
          raw_data: event.data,
        },
        timestamp: event.timestamp || new Date(),
        resolved: false, // ✅ New field
        notification_sent: false, // ✅ New field
      });

      await this.repo.save(row);
    } catch (error) {
      this.logger.error(`Failed to persist event: ${error.message}`);
    }
  }

  /**
   * Build human-readable description from event
   */
  private buildDescription(event: NormalizedEvent): string {
    const resourceName = event.resource.name || event.resource.id;
    const resourceType = event.resource.type;

    // Build description based on event type
    switch (event.eventType) {
      case 'trunk_status_changed':
        return `Trunk ${resourceName} status changed to ${event.data.status_text}`;

      case 'extension_registration_changed':
        return `Extension ${resourceName} ${event.data.registration_status === 1 ? 'registered' : 'unregistered'}`;

      case 'call_state_changed':
        return `Call ${event.data.call_id} state changed`;

      default:
        return `${resourceType} ${resourceName} event: ${event.eventType}`;
    }
  }

  /**
   * Determine severity based on event type and data
   */
  private determineSeverity(event: NormalizedEvent): string {
    // Critical events
    if (
      event.eventType.includes('trunk') &&
      (event.data.status === 41 || event.data.status === 42)
    ) {
      return 'critical'; // Trunk unreachable/registration failed
    }

    // Warning events
    if (
      event.eventType.includes('registration_changed') &&
      event.data.registration_status === 0
    ) {
      return 'warning'; // Extension went offline
    }

    // Info events (default)
    return 'info';
  }
}
