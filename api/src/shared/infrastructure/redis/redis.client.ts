// src/shared/infrastructure/redis/redis.client.ts
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

import { Redis } from 'ioredis';

export class RedisClient {
  private static instance: Redis;

  static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      });
    }
    return RedisClient.instance;
  }
}
