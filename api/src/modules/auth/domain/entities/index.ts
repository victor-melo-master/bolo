// src/modules/auth/domain/entities/index.ts — Ruta relativa desde src/
/**
 * Barrel exports para entidades de dominio del módulo auth.
 * Centraliza las exportaciones para facilitar importaciones.
 *
 * @module auth/domain/entities
 */

// Re-exporta User desde su archivo individual — permite importar desde 'entities' en lugar de la ruta completa
export { User } from './user.entity';
// Re-exporta Association — mismo patrón de barrel export para desacoplar la estructura de directorios
export { Association } from './association.entity';
// Re-exporta DriverRequest — los barrel exports evitan cadenas de importación largas y facilitan refactors
export { DriverRequest } from './driver-request.entity';
