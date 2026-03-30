import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEntity } from './entities/event.entity';
import { TrunkMonitoringEntity } from './entities/trunk-monitoring.entity';
import { NetworkMonitoringEntity } from './entities/network-monitoring.entity';
import { BandwidthMonitoringEntity } from './entities/bandwidth-monitoring.entity';
import { CallMonitoringEntity } from './entities/call-monitoring.entity';
import { SystemConfigurationEntity } from './entities/system-configuration.entity';
import { AlertManagementEntity } from './entities/alert-management.entity';
import { EventWriter } from './event.writer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      EventEntity,
      TrunkMonitoringEntity,
      NetworkMonitoringEntity,
      BandwidthMonitoringEntity,
      CallMonitoringEntity,
      SystemConfigurationEntity,
      AlertManagementEntity,
    ]),
  ],
  providers: [EventWriter],
  exports: [TypeOrmModule, EventWriter],
})
export class PersistenceModule {}