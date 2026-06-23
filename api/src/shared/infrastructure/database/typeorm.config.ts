// projectBolo/api/src/shared/infrastructure/database/typeorm.config.ts
// typeorm.config.ts
import { DataSourceOptions } from 'typeorm';
import { readFileSync } from 'fs';
import { UserOrmEntity } from '../../../modules/auth/infrastructure/orm/user.orm-entity';
import { AssociationOrmEntity } from '../../../modules/auth/infrastructure/orm/association.orm-entity';
import { DriverRequestOrmEntity } from '../../../modules/auth/infrastructure/orm/driver-request.orm-entity';

function readSecret(fileEnvKey: string, fallbackEnvKey?: string): string {
  const filePath = process.env[fileEnvKey];
  if (filePath) {
    try {
      return readFileSync(filePath, 'utf8').trim();
    } catch {
      console.error(`Error reading secret from ${filePath}`);
    }
  }
  return process.env[fallbackEnvKey ?? ''] ?? '';
}

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'postgres',
  password: readSecret('DB_PASSWORD_FILE', 'DB_PASSWORD'),
  database: process.env.DB_NAME ?? 'bolo',
  entities: [UserOrmEntity, AssociationOrmEntity, DriverRequestOrmEntity],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
};
