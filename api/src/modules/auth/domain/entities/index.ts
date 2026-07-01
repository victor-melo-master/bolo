// src/modules/auth/domain/entities/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports — Entidades de Dominio del Módulo Auth
 * ═══════════════════════════════════════════════════════════════
 *
 * Centraliza las exportaciones de todas las entidades de dominio
 * (Admin, Passenger, Session, Association, DriverRequest) para
 * simplificar las importaciones desde otros módulos.
 *
 * @module auth/domain/entities
 */

// Re-exporta User desde su archivo individual — permite importar desde 'entities' en lugar de la ruta completa
// export { User } from './user.entity'; // eliminar
// Re-exporta Association — mismo patrón de barrel export para desacoplar la estructura de directorios
export { Association } from './association.entity';
// Re-exporta DriverRequest — los barrel exports evitan cadenas de importación largas y facilitan refactors
export { DriverRequest } from './driver-request.entity';
// Re-exporta Admin, Passenger y Session
export { Admin } from './admin.entity';
export { Passenger } from './passenger.entity';
export { Session } from './session.entity';
