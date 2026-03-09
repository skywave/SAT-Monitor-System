import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from '../config/database.config';
import { EventEntity } from './entities/event.entity';
import { StateHistoryEntity } from './entities/state-history.entity';
import { ExtensionEventEntity } from './entities/extension-event.entity';
import { AgentEventEntity } from './entities/agent-event.entity';
import { CallTransferEventEntity } from './entities/call-transfer-event.entity';
import { NetworkMetricsEntity } from '../network/entities/network-metrics.entity';
import { DailyCallStatsEntity } from './entities/daily-call-stats.entity';
import { TrunkStatusHistoryEntity } from './entities/trunk-status-history.entity';
import { ExtensionStatusHistoryEntity } from './entities/extension-status-history.entity';
import { NetworkStatusHistoryEntity } from './entities/network-status-history.entity';
import { MonitoredDeviceEntity } from './entities/monitored-device.entity';
import { DeviceLatencyMetricsEntity } from './entities/device-latency-metrics.entity';
import { DeviceBandwidthMetricsEntity } from './entities/device-bandwidth-metrics.entity';
import { AlertRuleEntity } from './entities/alert-rule.entity';
import { EventWriter } from './event.writer';
import { StateWriter } from './state.writer';

@Module({
    imports: [
        TypeOrmModule.forRoot(databaseConfig),
        TypeOrmModule.forFeature([
          EventEntity,
          StateHistoryEntity,
          ExtensionEventEntity,
          AgentEventEntity,
          CallTransferEventEntity,
          NetworkMetricsEntity,
          DailyCallStatsEntity,
          TrunkStatusHistoryEntity,
          ExtensionStatusHistoryEntity,
          NetworkStatusHistoryEntity,
          MonitoredDeviceEntity,
          DeviceLatencyMetricsEntity,
          DeviceBandwidthMetricsEntity,
          AlertRuleEntity,
        ]),
    ],
    providers: [EventWriter, StateWriter],
    exports: [EventWriter, StateWriter, TypeOrmModule],
})
export class PersistenceModule {}
