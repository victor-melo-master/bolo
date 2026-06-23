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

// Domain exports
export * from './domain/entities';
// export * from './domain/value-objects';
// export * from './domain/exceptions';
export * from './domain/interfaces';

// Application exports
// export * from './application/use-cases';
export * from './application/dto';
// export * from './application/services';

// Infrastructure exports
export * from './infrastructure/auth.module';
