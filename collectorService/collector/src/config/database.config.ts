// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
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
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Keep this false now that migrations are live
  logging: true,
};

if (!process.env.DB_PASS) {
  throw new Error("CRITICAL: .env file not found or DB_PASS is missing!");
}