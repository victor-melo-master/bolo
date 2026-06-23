// src/shared/application/ports/cache.port.ts
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

export interface ICache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  delPattern(pattern: string): Promise<void>;
  flushAll(): Promise<void>;
}
