// src/config/database.config.ts

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',        // ← Change if your DB is elsewhere
  port: 5432,
  username: 'skenwise',     // ← Change to your username
  password: 'Black99raiser%*', // ← Change to your password
  database: 'sat_monitor',  // ← Change if you named it differently
  
  // Where to find entity files
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  
  // Auto-create tables (only for development!)
  synchronize: true,  // ⚠️ Set to false in production
  
  // Logging (helpful for debugging)
  logging: true,
};