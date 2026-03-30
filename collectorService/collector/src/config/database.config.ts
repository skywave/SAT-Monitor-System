// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { TrunkMonitoringEntity } from '../persistence/entities/trunk-monitoring.entity';
import { NetworkMonitoringEntity } from '../persistence/entities/network-monitoring.entity';
import { BandwidthMonitoringEntity } from '../persistence/entities/bandwidth-monitoring.entity';
import { CallMonitoringEntity } from '../persistence/entities/call-monitoring.entity';
import { SystemConfigurationEntity } from '../persistence/entities/system-configuration.entity';
import { EventEntity } from '../persistence/entities/event.entity';
import { AlertManagementEntity } from '../persistence/entities/alert-management.entity';

dotenv.config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
  username: process.env.DB_USER,
  password: String(process.env.DB_PASS || ''),
  database: process.env.DB_NAME,
  ssl: { 
    rejectUnauthorized: false // Required for Supabase connections
  },
  entities: [
    TrunkMonitoringEntity,
    NetworkMonitoringEntity,
    BandwidthMonitoringEntity,
    CallMonitoringEntity,
    SystemConfigurationEntity,
    EventEntity,
    AlertManagementEntity,
  ],
  synchronize: false,
  logging: true,
};

if (!process.env.DB_PASS) {
  throw new Error("CRITICAL: .env file not found or DB_PASS is missing!");
}