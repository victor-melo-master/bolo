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
import { Redis } from 'ioredis'; // ioredis: cliente Redis con soporte para Redis 7, cluster, Sentinel y pipelining

// ─── Cliente Singleton de Redis 7 — Patrón Singleton ───
// Implementa el puerto ICache (ver cache.port.ts) utilizando ioredis.
// El patrón Singleton garantiza que toda la aplicación reutilice la misma conexión Redis,
// evitando el agotamiento de conexiones y simplificando la configuración.
export class RedisClient {
  private static instance: Redis; // Almacena la instancia única de la conexión Redis (compartida globalmente)

  // Retorna la instancia única del cliente Redis, creándola si es la primera vez que se invoca
  static getInstance(): Redis {
    // Si instance es null/undefined, se crea la conexión con la configuración de entorno
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        host: process.env.REDIS_HOST || 'localhost', // Host de Redis (variable REDIS_HOST o localhost por defecto)
        port: parseInt(process.env.REDIS_PORT || '6379'), // Puerto de Redis (variable REDIS_PORT o 6379 por defecto)
      });
    }
    // Retorna la instancia única existente o la recién creada
    return RedisClient.instance;
  }
}
