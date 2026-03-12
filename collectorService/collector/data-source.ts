// data-source.ts

import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
  username: process.env.DB_USER,
  password: String(process.env.DB_PASS || ''),
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  entities: [],  // ✅ Empty for now (just to test migration)
  migrations: ['src/persistence/migrations/**/*.ts'],
  synchronize: false,
  logging: true,
});