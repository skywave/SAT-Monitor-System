import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PbxModule } from '../pbx/pbx.module';
import { NetworkMetricsEntity } from './entities/network-metrics.entity';
import { NetworkMonitorService } from './network-monitor.service';
import { PingService } from './ping.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([NetworkMetricsEntity]),
    PbxModule,
    ConfigModule,
  ],
  providers: [NetworkMonitorService, PingService],
  exports: [NetworkMonitorService],
})
export class NetworkModule {}
