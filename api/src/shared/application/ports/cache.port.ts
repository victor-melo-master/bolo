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

export interface ICache {
  // Recupera un valor del caché por su clave; retorna null si no existe
  get(key: string): Promise<string | null>;
  // Almacena un valor en el caché con clave, valor y TTL opcional en segundos
  set(key: string, value: string, ttl?: number): Promise<void>;
  // Elimina una entrada específica del caché por su clave
  del(key: string): Promise<void>;
  // Elimina todas las entradas que coincidan con un patrón glob (ej: "session:*")
  delPattern(pattern: string): Promise<void>;
  // Vacía completamente el caché — usado en tests o reinicios controlados
  flushAll(): Promise<void>;
}
