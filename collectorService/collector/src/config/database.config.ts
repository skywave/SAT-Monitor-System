// src/config/database.config.ts

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'aws-1-eu-west-1.pooler.supabase.com',  // ✅ Pooler host
  port: 5432,
  username: 'postgres.mlpfnfbgpraprzuysnge',     
  password: 'Black99raiser%*',                    
  database: 'postgres',
  ssl: { rejectUnauthorized: false },             
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,  // ✅ Don't auto-sync in cloud
  logging: true,
};