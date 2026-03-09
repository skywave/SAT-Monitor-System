import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentEventEntity } from '../../persistence/entities/agent-event.entity';
import { NormalizedEvent } from '../processors/event-normalizer';

/**
 * Handles agent status change events (30029)
 */
@Injectable()
export class AgentEventHandler {
  private readonly logger = new Logger(AgentEventHandler.name);

  constructor(
    @InjectRepository(AgentEventEntity)
    private readonly repo: Repository<AgentEventEntity>,
  ) {}

  async handle(event: NormalizedEvent): Promise<void> {
    if (event.eventType !== 'agent_status_changed') {
      return;
    }

    try {
      this.logger.log(
        `👤 Agent status: ${event.data.status_text} - ` +
        `${event.resource.name} (${event.pbxId})`
      );

      const row = this.repo.create({
        pbx_id: event.pbxId,
        pbx_sn: event.pbxSn,
        event_type: event.eventType,
        agent_id: event.data.agent_id,
        agent_name: event.data.agent_name,
        agent_status: event.data.agent_status,
        queue_id: event.data.queue_id,
        data: event.data,
        raw: event.raw,
      });

      await this.repo.save(row);
    } catch (error) {
      this.logger.error(`Failed to handle agent event: ${error.message}`);
    }
  }
}
