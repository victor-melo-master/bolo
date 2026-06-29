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

// ─── Tipos de TypeORM ───
import { DataSourceOptions } from 'typeorm'; // Tipo para la configuración del DataSource (conexión a la base de datos)
// ─── Sistema de archivos (lectura de secretos Docker/K8s) ───
import { readFileSync } from 'fs'; // readFileSync: lee archivos de secretos montados en /run/secrets/ por Docker Swarm o K8s
// ─── Entidades ORM registradas en la conexión ───
// import { UserOrmEntity } from '../../../modules/auth/infrastructure/orm/user.orm-entity'; // Usuarios del sistema (auth.users)
import { AssociationOrmEntity } from '../../../modules/auth/infrastructure/orm/association.orm-entity'; // Cooperativas/asociaciones (auth.associations)
import { DriverRequestOrmEntity } from '../../../modules/auth/infrastructure/orm/driver-request.orm-entity'; // Solicitudes de conductor (auth.driver_requests)
import { WalletOrmEntity, CoopFareOrmEntity } from 'src/modules/fin'; // Billetera digital y tarifas por cooperativa (fin.*)
import { RouteOrmEntity } from 'src/modules/ops/infrastructure/orm/route.orm-entity'; // Rutas predefinidas (ops.routes)
import { ExchangeRateOrmEntity } from '../../../modules/fin/infrastructure/orm/exchange-rate.orm-entity'; // Tasas de cambio (fin.exchange_rates)
import { PassengerOrmEntity } from 'src/modules/auth/infrastructure/orm/passenger.orm-entity';
import { AdminOrmEntity } from 'src/modules/auth/infrastructure/orm/admin.orm-entity';
import { SessionOrmEntity } from 'src/modules/auth/infrastructure/orm/session.orm-entity';

// ─── Función auxiliar: leer secretos desde archivos Docker/K8s ───
// Busca primero en un archivo de secreto montado por Docker Swarm o Kubernetes (ruta en variable fileEnvKey).
// Si no existe el archivo o falla la lectura, usa la variable de entorno fallbackEnvKey como respaldo.
// Esto permite el mismo código funcione tanto en producción orquestada como en desarrollo local.
function readSecret(fileEnvKey: string, fallbackEnvKey?: string): string {
  const filePath = process.env[fileEnvKey]; // Obtiene la ruta del archivo de secreto desde una variable de entorno
  if (filePath) {
    try {
      return readFileSync(filePath, 'utf8').trim(); // Lee el archivo completo y recorta espacios en blanco
    } catch {
      // Si el archivo no existe o no se puede leer (ej. permisos), se loggea el error
      // pero se continúa con el fallback para no bloquear el arranque del servicio
      console.error(`Error reading secret from ${filePath}`);
    }
  }
  // Fallback a variable de entorno directa, o cadena vacía si ninguna está definida
  return process.env[fallbackEnvKey ?? ''] ?? '';
}

// ─── Configuración del DataSource de TypeORM para PostgreSQL 18 + PostGIS 3 ───
// Se exporta como constante para ser usada en AppModule (TypeOrmModule.forRoot(typeOrmConfig))
// y también podría ser usada por TypeORM CLI para migraciones (data-source.ts).
export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres', // Dialecto de base de datos: PostgreSQL con extensiones PostGIS
  host: process.env.DB_HOST ?? 'localhost', // Host de la base de datos (definido en .env o docker-compose)
  port: parseInt(process.env.DB_PORT ?? '5432', 10), // Puerto PostgreSQL (por defecto 5432), parseado a entero base 10
  username: process.env.DB_USER ?? 'postgres', // Usuario de conexión a la base de datos
  password: readSecret('DB_PASSWORD_FILE', 'DB_PASSWORD'), // Contraseña: prioriza archivo secreto Docker, luego variable de entorno
  database: process.env.DB_NAME ?? 'bolo', // Nombre de la base de datos (por defecto 'bolo')
  entities: [
    // Lista explícita de entidades ORM registradas en esta conexión
    // UserOrmEntity, // eliminado por division de tablas en Passger y Admin
    PassengerOrmEntity,
    AdminOrmEntity,
    AssociationOrmEntity,
    SessionOrmEntity,
    DriverRequestOrmEntity,
    WalletOrmEntity,
    CoopFareOrmEntity,
    ExchangeRateOrmEntity,
    RouteOrmEntity,
  ],
  // synchronize: false — DESHABILITADO en producción. Los cambios de esquema se controlan mediante
  // migraciones manuales (init.sql, archivos SQL versionados) para evitar pérdida de datos.
  synchronize: false,
  // logging: en desarrollo solo se registran errores y advertencias de TypeORM para no saturar los logs;
  // en producción se desactiva completamente el logging de TypeORM (se usa Winston en su lugar).
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : false,
};
