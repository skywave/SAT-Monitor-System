/**
 * snapshot.module.ts
 *
 * Cached snapshot API for the NotificationSystem contract.
 * ScheduleModule is already registered at app.module.ts level.
 */

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PbxModule } from '../pbx/pbx.module';
import { SnapshotController } from './snapshot.controller';
import { SnapshotService } from './snapshot.service';

@Module({
  imports: [PbxModule, ScheduleModule],
  controllers: [SnapshotController],
  providers: [SnapshotService],
  exports: [SnapshotService],
})
export class SnapshotModule {}