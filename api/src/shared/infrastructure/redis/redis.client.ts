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

// Importa la clase Redis de ioredis para la conexión con Redis 7
import { Redis } from 'ioredis';

// Cliente singleton de Redis que reusa una única conexión en toda la aplicación
export class RedisClient {
  // Almacena la instancia única de Redis (patrón Singleton)
  private static instance: Redis;

  // Retorna la instancia única, creándola si aún no existe
  static getInstance(): Redis {
    // Si aún no se ha creado la instancia, la inicializa con la configuración de conexión
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis({
        // Host de Redis, por defecto localhost para desarrollo local
        host: process.env.REDIS_HOST || 'localhost',
        // Puerto de Redis, por defecto 6379 (puerto estándar de Redis)
        port: parseInt(process.env.REDIS_PORT || '6379'),
      });
    }
    // Retorna la instancia única ya existente o recién creada
    return RedisClient.instance;
  }
}
