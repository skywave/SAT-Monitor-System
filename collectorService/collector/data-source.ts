import { DataSource } from 'typeorm';
import { join } from 'path';

// TypeORM CLI expects a DataSource instance exported from this file.
export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'skenwise',
  password: 'Black99raiser%*',
  database: 'sat_monitor',
  entities: [], // Temporarily disabled to debug migration
  migrations: [join(process.cwd(), 'src/persistence/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
});
