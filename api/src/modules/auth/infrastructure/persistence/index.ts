// src/modules/auth/infrastructure/persistence/index.ts — Ruta relativa desde src/
/**
 * Barrel exports para implementaciones de repositorios del módulo auth.
 *
 * @module auth/infrastructure/persistence
 */

// Se re-exportan las implementaciones concretas de los repositorios para
// que auth.module.ts pueda importarlas desde './persistence'.
// Cada clase implementa su puerto correspondiente del dominio y es
// inyectable mediante el token definido en domain/interfaces.
export { PassengerRepositoryImpl } from './passenger.repository.impl';
export { AdminRepositoryImpl } from './admin.repository.impl';
export { SessionRepositoryImpl } from './session.repository.impl';
export { AssociationRepositoryImpl } from './association.repository.impl';
export { DriverRequestRepositoryImpl } from './driver-request.repository.impl';
