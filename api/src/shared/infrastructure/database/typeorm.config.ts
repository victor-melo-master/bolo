import { DataSource, DataSourceOptions } from 'typeorm';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'bolo',
  entities: ['**/*.orm-entity.ts'],
  migrations: ['**/migrations/*.ts'],
  synchronize: false,
};

export const AppDataSource = new DataSource(typeOrmConfig);
