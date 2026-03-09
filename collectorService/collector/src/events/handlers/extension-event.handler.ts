import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExtensionEventEntity } from '../../persistence/entities/extension-event.entity';
import { NormalizedEvent } from '../processors/event-normalizer';

/**
 * Handles extension registration and call state events (30007, 30008, 30022)
 */
@Injectable()
export class ExtensionEventHandler {
  private readonly logger = new Logger(ExtensionEventHandler.name);

  constructor(
    @InjectRepository(ExtensionEventEntity)
    private readonly repo: Repository<ExtensionEventEntity>,
  ) {}

  async handle(event: NormalizedEvent): Promise<void> {
    if (!['extension_registration_changed', 'extension_call_state_changed', 'extension_info_updated'].includes(event.eventType)) {
      return;
    }

    try {
      this.logger.log(
        `📞 Extension event: ${event.eventType} - ` +
        `${event.resource.name} (${event.pbxId})`
      );

      const row = this.repo.create({
        pbx_id: event.pbxId,
        pbx_sn: event.pbxSn,
        event_type: event.eventType,
        ext_id: event.data.ext_id,
        ext_name: event.data.ext_name,
        registration_status: event.data.registration_status,
        call_status: event.data.call_status,
        call_id: event.data.call_id,
        data: event.data,
        raw: event.raw,
      });

      await this.repo.save(row);
    } catch (error) {
      this.logger.error(`Failed to handle extension event: ${error.message}`);
    }
  }
}
