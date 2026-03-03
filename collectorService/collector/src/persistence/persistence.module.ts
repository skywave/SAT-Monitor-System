import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../config/database.config';
import { EventEntity } from './entities/event.entity';
import { StateHistoryEntity } from './entities/state-history.entity';
import { EventWriter } from './event.writer';
import { StateWriter } from './state.writer';

@Module({
    imports: [
        TypeOrmModule.forRoot(databaseConfig),
        TypeOrmModule.forFeature([EventEntity, StateHistoryEntity]),
    ],
    providers: [EventWriter, StateWriter],
    exports: [EventWriter, StateWriter, TypeOrmModule],
})
export class PersistenceModule {}
