import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { PBXDataService } from './pbx-data.service';
import { EventsModule } from '../events/events.module';
import { NetworkModule } from '../network/network.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrunkMonitoringEntity } from 'src/persistence/entities/trunk-monitoring.entity';
import { NetworkMonitoringEntity } from 'src/persistence/entities/network-monitoring.entity';
import { BandwidthMonitoringEntity } from 'src/persistence/entities/bandwidth-monitoring.entity';

@Module({
  imports: [EventsModule, HttpModule, NetworkModule, TypeOrmModule.forFeature([TrunkMonitoringEntity, NetworkMonitoringEntity,
    BandwidthMonitoringEntity
  ])],
  providers: [MonitoringService, PBXDataService],
  controllers: [MonitoringController],
  exports: [MonitoringService, PBXDataService],
})
export class SupervisorModule {}
