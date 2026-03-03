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
				pbx_sn: event.pbxSn,
				event_type: event.eventType,
				event_id: String(event.eventId),
				resource_type: event.resource.type,
				resource_id: event.resource.id,
				resource_name: event.resource.name,
				data: event.data,
				raw: event.raw,
				timestamp: event.timestamp || new Date(),
			});

			await this.repo.save(row);
		} catch (error) {
			this.logger.error(`Failed to persist event: ${error.message}`);
		}
	}
}
