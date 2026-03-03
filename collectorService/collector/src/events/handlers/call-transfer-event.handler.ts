import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallTransferEventEntity } from '../../persistence/entities/call-transfer-event.entity';
import { NormalizedEvent } from '../processors/event-normalizer';

/**
 * Handles call transfer events (30013)
 */
@Injectable()
export class CallTransferEventHandler {
  private readonly logger = new Logger(CallTransferEventHandler.name);

  constructor(
    @InjectRepository(CallTransferEventEntity)
    private readonly repo: Repository<CallTransferEventEntity>,
  ) {}

  async handle(event: NormalizedEvent): Promise<void> {
    if (event.eventType !== 'call_transferred') {
      return;
    }

    try {
      this.logger.log(
        `🔄 Call transferred: ${event.data.call_id} ` +
        `from ${event.data.from} to ${event.data.to} (${event.pbxId})`
      );

      const row = this.repo.create({
        pbx_id: event.pbxId,
        pbx_sn: event.pbxSn,
        call_id: event.data.call_id,
        from_party: event.data.from,
        to_party: event.data.to,
        transferrer: event.data.transferrer,
        data: event.data,
        raw: event.raw,
      });

      await this.repo.save(row);
    } catch (error) {
      this.logger.error(`Failed to handle call transfer event: ${error.message}`);
    }
  }
}
