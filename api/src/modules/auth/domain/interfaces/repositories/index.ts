// src/modules/auth/domain/interfaces/repositories/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports — Puertos de Repositorio del Módulo Auth
 * ═══════════════════════════════════════════════════════════════
 *
 * Agrupa los puertos de repositorio (AdminRepositoryPort,
 * PassengerRepositoryPort, SessionRepositoryPort, etc.) y sus
 * tokens de inyección de dependencias correspondientes.
 *
 * @module auth/domain/interfaces/repositories
 */

// Re-exporta todos los puertos de repositorio para facilitar imports desde un solo punto
export { PASSENGER_REPOSITORY_PORT } from './passenger.repository.port';
export type { PassengerRepositoryPort } from './passenger.repository.port';

export { ADMIN_REPOSITORY_PORT } from './admin.repository.port';
export type { AdminRepositoryPort } from './admin.repository.port';

export { SESSION_REPOSITORY_PORT } from './session.repository.port';
export type { SessionRepositoryPort } from './session.repository.port';

// Mantener los existentes si aún se usan:
export { ASSOCIATION_REPOSITORY_PORT } from './association.repository.port';
export type { AssociationRepositoryPort } from './association.repository.port';

export { DRIVER_REQUEST_REPOSITORY_PORT } from './driver-request.repository.port';
export type { DriverRequestRepositoryPort } from './driver-request.repository.port';
