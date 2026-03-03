import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StateHistoryEntity } from './entities/state-history.entity';
import { NormalizedEvent } from '../events/processors/event-normalizer';

@Injectable()
export class StateWriter {
	private readonly logger = new Logger(StateWriter.name);

	constructor(
		@InjectRepository(StateHistoryEntity)
		private readonly repo: Repository<StateHistoryEntity>,
	) {}

	async writeStateChange(event: NormalizedEvent, previousState: any): Promise<void> {
		try {
			const row = this.repo.create({
				pbx_id: event.pbxId,
				resource_type: event.resource.type,
				resource_id: event.resource.id,
				previous_state: previousState || null,
				current_state: event.data,
				changed_at: event.timestamp || new Date(),
			});

			await this.repo.save(row);
		} catch (error) {
			this.logger.error(`Failed to persist state change: ${error.message}`);
		}
	}
}
