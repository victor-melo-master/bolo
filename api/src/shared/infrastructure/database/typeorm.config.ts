import { DataSource, DataSourceOptions } from 'typeorm'; // ← cambia la importación

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'bolos_db',
  entities: [__dirname + '/../../**/*.orm-entity{.ts,.js}'],
  synchronize: false,
};

export const AppDataSource = new DataSource(typeOrmConfig); // ahora funciona
