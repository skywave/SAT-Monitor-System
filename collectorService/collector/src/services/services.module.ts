import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CallAggregatorService } from './call-aggregator.service';
import { BandwidthEstimatorService } from './bandwidth-estimator.service';
import { ConfigSeederService } from './config-seeder.service';
import { CallMonitoringEntity } from '../persistence/entities/call-monitoring.entity';
// import { BandwidthMonitoringEntity } from '../persistence/entities/bandwidth-monitoring.entity';
import { SystemConfigurationEntity } from '../persistence/entities/system-configuration.entity';
import { PbxModule } from '../pbx/pbx.module';
import { AlertCheckerService } from './alert-checker.service';
import { AlertManagementEntity } from '../persistence/entities/alert-management.entity';
import { TrunkMonitoringEntity } from '../persistence/entities/trunk-monitoring.entity';
import { NetworkMonitoringEntity } from '../persistence/entities/network-monitoring.entity';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    PbxModule,
    TypeOrmModule.forFeature([
      CallMonitoringEntity,
//       BandwidthMonitoringEntity,
      SystemConfigurationEntity,
      AlertManagementEntity,
      TrunkMonitoringEntity,
      NetworkMonitoringEntity,

    ]),
  ],
  providers: [
    CallAggregatorService,
//    BandwidthEstimatorService,
    ConfigSeederService,
    AlertCheckerService,
  ],
  exports: [
    CallAggregatorService,
//    BandwidthEstimatorService,
    ConfigSeederService,
    AlertCheckerService,
  ],
})
export class ServicesModule {}