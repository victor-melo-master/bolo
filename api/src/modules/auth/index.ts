// src/modules/auth/index.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * Auth Module — Barrel Exports
 * ═══════════════════════════════════════════════════════════════
 *
 * Punto de entrada único para el módulo auth. Exporta:
 *   - Entidades de dominio (User, Association, DriverRequest)
 *   - Puertos/interfaces (repositorios, servicios externos)
 *   - DTOs de aplicación (CreateUserDto)
 *   - Módulo de infraestructura (AuthModule)
 *
 * Las exportaciones comentadas están pendientes de implementación.
 *
 * @module auth/index
 */

// ─── Capa de Dominio ───────────────────────────────────────────
export * from './domain/entities';
// export * from './domain/value-objects';       // Pendiente de implementar
// export * from './domain/exceptions';          // Pendiente de implementar
export * from './domain/interfaces'; // Puertos (repositorios + servicios externos)

// ─── Capa de Aplicación ───────────────────────────────────────
// export * from './application/use-cases';      // Pendiente de implementar
export * from './application/dto'; // Data Transfer Objects (ej. CreateUserDto)
// export * from './application/services';       // Pendiente de implementar

// ─── Capa de Infraestructura ──────────────────────────────────
export * from './infrastructure/auth.module'; // Módulo raíz de NestJS para auth
