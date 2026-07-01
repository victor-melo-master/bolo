// src/shared/infrastructure/redis/redis.client.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * RedisClient — Cliente Singleton de Redis 7
 * ═══════════════════════════════════════════════════════════════
 *
 * Implementación del puerto ICache utilizando ioredis.
 * Sigue el patrón Singleton para reusar la misma conexión Redis
 * en toda la aplicación. Se conecta a Redis 7 Alpine.
 *
 * Usos previstos:
 *   - Caché de sesiones JWT (blacklist de tokens revocados)
 *   - Rate-limiting por IP/usuario
 *   - Tracking GPS en tiempo real (viajes activos)
 *   - Colas de procesamiento asíncrono (opcional)
 *
 * Capa: Infraestructura (shared/redis)
 * Dependencias:
 *   - ioredis ^5.11
 *   - process.env (REDIS_HOST, REDIS_PORT)
 *
 * @module RedisClient
 * @see ICache
 */

// ─── Importación de ioredis ───
// src/shared/infrastructure/redis/redis.client.ts

import { Redis } from 'ioredis';
import { readFileSync } from 'fs';
import { Logger } from '@nestjs/common';

const logger = new Logger('RedisClient');

/**
 * Crea una instancia de Redis leyendo la contraseña desde el archivo secreto
 * (si existe) o desde la variable de entorno.
 */
function createRedisClient(): Redis {
  const host = process.env.REDIS_HOST || 'localhost';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);
  let password: string | undefined;

  // Leer desde archivo si existe la variable *_FILE
  if (process.env.REDIS_PASSWORD_FILE) {
    try {
      password = readFileSync(process.env.REDIS_PASSWORD_FILE, 'utf8').trim();
    } catch (err: unknown) {
      logger.error(
        'Error al leer el archivo de contraseña de Redis',
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  if (!password) {
    password = process.env.REDIS_PASSWORD;
  }

  return new Redis({ host, port, password });
}

// Singleton que se usará como provider
export const redisClient = createRedisClient();
