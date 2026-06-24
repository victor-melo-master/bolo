// src/modules/auth/domain/interfaces/repositories/index.ts
/**
 * Barrel exports para puertos de repositorio del módulo auth.
 *
 * @module auth/domain/interfaces/repositories
 */

// Re-exporta todos los puertos de repositorio para facilitar imports desde un solo punto
export * from './user.repository.port';
export * from './association.repository.port';
export * from './driver-request.repository.port';
