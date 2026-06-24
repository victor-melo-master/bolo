// src/shared/infrastructure/database/typeorm.config.ts — Ruta relativa desde src/
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

// Importa el tipo de opciones de configuración para el DataSource de TypeORM
import { DataSourceOptions } from 'typeorm';
// Importa readFileSync para leer archivos de secretos montados por Docker/K8s
import { readFileSync } from 'fs';
// Entidades ORM del módulo auth que se registrarán en la conexión
import { UserOrmEntity } from '../../../modules/auth/infrastructure/orm/user.orm-entity';
import { AssociationOrmEntity } from '../../../modules/auth/infrastructure/orm/association.orm-entity';
import { DriverRequestOrmEntity } from '../../../modules/auth/infrastructure/orm/driver-request.orm-entity';
import { WalletOrmEntity } from 'src/modules/fin';

// Lee un secreto desde archivo (Docker Swarm/K8s) o de variable de entorno como fallback
function readSecret(fileEnvKey: string, fallbackEnvKey?: string): string {
  // Obtiene la ruta del archivo de secreto desde la variable de entorno
  const filePath = process.env[fileEnvKey];
  if (filePath) {
    try {
      // Lee el archivo y elimina espacios/blancos alrededor del valor
      return readFileSync(filePath, 'utf8').trim();
    } catch {
      // Si falla la lectura del archivo, muestra error pero continúa con el fallback
      console.error(`Error reading secret from ${filePath}`);
    }
  }
  // Retorna el valor de la variable de entorno de respaldo o cadena vacía si no existe
  return process.env[fallbackEnvKey ?? ''] ?? '';
}

// Configuración exportada del DataSource de TypeORM para PostgreSQL
export const typeOrmConfig: DataSourceOptions = {
  // Dialecto de base de datos: PostgreSQL
  type: 'postgres',
  // Host de la base de datos, por defecto localhost
  host: process.env.DB_HOST ?? 'localhost',
  // Puerto de PostgreSQL, por defecto 5432, convertido a número entero base 10
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  // Usuario de conexión, por defecto postgres
  username: process.env.DB_USER ?? 'postgres',
  // Contraseña: intenta desde archivo secreto primero, luego variable de entorno
  password: readSecret('DB_PASSWORD_FILE', 'DB_PASSWORD'),
  // Nombre de la base de datos, por defecto bolo
  database: process.env.DB_NAME ?? 'bolo',
  // Lista explícita de entidades registradas en esta conexión
  entities: [
    UserOrmEntity,
    AssociationOrmEntity,
    DriverRequestOrmEntity,
    WalletOrmEntity,
  ],
  // sincronización automática deshabilitada: los cambios de esquema se manejan con migraciones manuales
  synchronize: false,
  // En desarrollo solo se loggean errores y advertencias; en producción no hay logging de queries
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
};
