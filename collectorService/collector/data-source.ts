// data-source.ts

import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'aws-1-eu-west-1.pooler.supabase.com',
  port: 5432,
  username: 'postgres.mlpfnfbgpraprzuysnge',
  password: 'Black99raiser%*',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
  entities: [],  // ✅ Empty for now (just to test migration)
  migrations: ['src/persistence/migrations/**/*.ts'],
  synchronize: false,
  logging: true,
});