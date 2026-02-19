// src/endpoints/endpoints.module.ts
import { Module } from '@nestjs/common';
import { PbxModule } from '../pbx/pbx.module';

// Import all controllers
import { SystemController } from './system.controller';
import { ExtensionController } from './extension.controller';
import { TrunkController } from './trunk.controller';
import { ContactController } from './contact.controller';
import { RoutingController } from './routing.controller';
import { VoicemailController } from './voicemail.controller';
import { IvrQueueController } from './ivr-queue.controller';
import { ConferenceController } from './conference.controller';
import { CallControlController } from './call-control.controller';
import { RecordingCdrController } from './recording-cdr.controller';
import { MessagingController } from './messaging.controller';
import { HotelController } from './hotel.controller';
import { MonitoringController } from './monitoring.controller';
import { StorageController } from './storage.controller';

@Module({
  imports: [PbxModule],
  controllers: [
    SystemController,
    ExtensionController,
    TrunkController,
    ContactController,
    RoutingController,
    VoicemailController,
    IvrQueueController,
    ConferenceController,
    CallControlController,
    RecordingCdrController,
    MessagingController,
    HotelController,
    MonitoringController,
    StorageController,
  ],
})
export class EndpointsModule {}