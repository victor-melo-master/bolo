// src/shared/infrastructure/database/typeorm.config.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * typeorm.config — Configuración de TypeORM / PostgreSQL
 * ═══════════════════════════════════════════════════════════════
 *
 * Configura la conexión a PostgreSQL 18 + PostGIS 3 usando TypeORM.
 * Soporta:
 *   - Lectura de secrets desde archivos Docker (/run/secrets/)
 *   - Fallback a variables de entorno para desarrollo local
 *   - Listado explícito de entidades registradas
 *   - Modo synchronize DESHABILITADO (los cambios de esquema se
 *     controlan mediante init.sql y migraciones manuales)
 *
 * Función auxiliar readSecret():
 *   Busca primero en ruta de archivo secreto (Docker Swarm/K8s),
 *   luego en variable de entorno directa, luego default vacío.
 *
 * Capa: Infraestructura (shared/database)
 * Dependencias:
 *   - TypeORM DataSourceOptions
 *   - ORM entities del módulo auth (las únicas registradas por ahora)
 *   - process.env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
 *
 * @module typeorm.config
 * @see DataSourceOptions
 */

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
