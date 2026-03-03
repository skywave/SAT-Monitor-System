import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../config/database.config';
import { EventEntity } from './entities/event.entity';
import { StateHistoryEntity } from './entities/state-history.entity';
import { ExtensionEventEntity } from './entities/extension-event.entity';
import { AgentEventEntity } from './entities/agent-event.entity';
import { CallTransferEventEntity } from './entities/call-transfer-event.entity';
import { EventWriter } from './event.writer';
import { StateWriter } from './state.writer';

@Module({
    imports: [
        TypeOrmModule.forRoot(databaseConfig),
        TypeOrmModule.forFeature([
          EventEntity,
          StateHistoryEntity,
          ExtensionEventEntity,
          AgentEventEntity,
          CallTransferEventEntity,
        ]),
    ],
    providers: [EventWriter, StateWriter],
    exports: [EventWriter, StateWriter, TypeOrmModule],
})
export class PersistenceModule {}
