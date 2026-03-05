import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
import { PBXDataService } from './pbx-data.service';
import { EventsModule } from '../events/events.module';
import { NetworkModule } from '../network/network.module';

@Module({
  imports: [EventsModule, HttpModule, NetworkModule],
  providers: [MonitoringService, PBXDataService],
  controllers: [MonitoringController],
  exports: [MonitoringService, PBXDataService],
})
export class SupervisorModule {}
