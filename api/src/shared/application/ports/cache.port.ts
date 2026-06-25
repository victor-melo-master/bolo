// src/shared/application/ports/cache.port.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * ICache — Puerto de Servicio de Caché
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para el sistema de caché del proyecto.
 * La implementación concreta usará Redis 7 (ver RedisClient en
 * infraestructura). Permite almacenar sesiones JWT, rate-limiting,
 * y datos temporales de tracking GPS.
 *
 * Capa: Aplicación (shared) — Puerto de salida
 *
 * @module ICache
 */

// ─── Puerto de salida: Servicio de Caché (Arquitectura Hexagonal) ───
// Define el contrato para operaciones de caché que la implementación concreta (RedisClient)
// debe satisfacer. La capa de aplicación programa contra esta interfaz, no contra Redis
// directamente, permitiendo cambiar la implementación (Redis, Memcached, in-memory) sin
// afectar los casos de uso.
export interface ICache {
  // Recupera un valor del caché por su clave. Retorna null si la clave no existe o expiró.
  get(key: string): Promise<string | null>;

  // Almacena un valor en el caché con un TTL opcional (time-to-live en segundos).
  // Si no se especifica ttl, el valor permanece indefinidamente hasta que se elimine explícitamente.
  set(key: string, value: string, ttl?: number): Promise<void>;

  // Elimina una entrada específica del caché por su clave. No lanza error si la clave no existe.
  del(key: string): Promise<void>;

  // Elimina todas las entradas que coincidan con un patrón glob (ej: "session:*", "rate-limit:*").
  // Útil para limpiar grupos de entradas relacionadas (ej. todas las sesiones de un usuario).
  delPattern(pattern: string): Promise<void>;

  // Vacía completamente el caché (FLUSHALL en Redis). Usado principalmente en tests
  // para garantizar un estado limpio entre ejecuciones, o en reinicios controlados del sistema.
  flushAll(): Promise<void>;
}
