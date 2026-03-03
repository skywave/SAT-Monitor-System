import { DataSource } from 'typeorm';
import { databaseConfig } from './src/config/database.config';

// TypeORM CLI expects a DataSource instance exported from this file.
export default new DataSource({
  // Spread values from NestJS TypeOrmModule options
  type: 'postgres',
  host: (databaseConfig as any).host,
  port: (databaseConfig as any).port,
  username: (databaseConfig as any).username,
  password: (databaseConfig as any).password,
  database: (databaseConfig as any).database,
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/migrations/*{.ts,.js}'],
});
