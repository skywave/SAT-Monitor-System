// src/supervisor/supervisor.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { EventsModule } from '../events/events.module';
import { NetworkModule } from '../network/network.module';
import { AMIModule } from '../ami/ami.module';  // ← ADD THIS
import { MonitoringService } from './monitoring.service';
import { PBXDataService } from './pbx-data.service';
import { MonitoringController } from './monitoring.controller';
import { TrunkMonitoringEntity } from '../persistence/entities/trunk-monitoring.entity';
import { NetworkMonitoringEntity } from '../persistence/entities/network-monitoring.entity';
import { BandwidthMonitoringEntity } from '../persistence/entities/bandwidth-monitoring.entity';
import { SupervisorService } from './supervisor.service';

@Module({
  imports: [
    EventsModule,
    NetworkModule,
    AMIModule,  // ← ADD THIS
    HttpModule,
    TypeOrmModule.forFeature([
      TrunkMonitoringEntity,
      NetworkMonitoringEntity,
      BandwidthMonitoringEntity,
    ]),
  ],
  controllers: [MonitoringController],
  providers: [
    MonitoringService,
    PBXDataService,
    SupervisorService,
  ],
  exports: [MonitoringService, PBXDataService, SupervisorService],
})
export class SupervisorModule {}