// src/modules/auth/domain/interfaces/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports — Puertos de Dominio del Módulo Auth
 * ═══════════════════════════════════════════════════════════════
 *
 * Agrupa y re-exporta todos los puertos (interfaces) de repositorios
 * y servicios externos del módulo de autenticación.
 *
 * @module auth/domain/interfaces
 */

// Agrupa y re-exporta todos los puertos del módulo auth (repositorios + servicios externos)
export * from './repositories';
export * from './services';
