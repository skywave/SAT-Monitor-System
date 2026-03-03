// src/events/events.module.ts

import { Module } from '@nestjs/common';
import { PbxModule } from '../pbx/pbx.module';
import { PersistenceModule } from '../persistence/persistence.module';

// WebSocket
import { YeastarWebSocketService } from './websocket/websocket.service';
import { WebSocketManager } from './websocket/websocket.manager';

// Processors
import { EventNormalizer } from './processors/event-normalizer';
import { StateTracker } from './processors/state-tracker';
import { EventLogger } from './processors/event.logger';
import { EventEmitter } from './processors/event-emitter';
import { EventProcessor } from './processors/event-processor';

@Module({
  imports: [PbxModule, PersistenceModule],
  providers: [WebSocketManager, EventNormalizer, StateTracker, EventLogger, EventEmitter, EventProcessor],
  exports: [WebSocketManager,StateTracker],
})
export class EventsModule {}