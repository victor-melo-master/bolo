// src/modules/auth/infrastructure/orm/index.ts — Ruta relativa desde src/
/**
 * Barrel exports para entidades ORM (TypeORM) del módulo auth.
 *
 * @module auth/infrastructure/orm
 */

// Se re-exportan las entidades ORM para que auth.module.ts pueda importarlas
// desde './orm' en lugar de importar cada archivo individualmente.
// Cada entidad mapea una tabla de PostgreSQL en el esquema 'auth'.
export { PassengerOrmEntity } from './passenger.orm-entity';
export { AdminOrmEntity } from './admin.orm-entity';
export { SessionOrmEntity } from './session.orm-entity';
export { AssociationOrmEntity } from './association.orm-entity';
export { DriverRequestOrmEntity } from './driver-request.orm-entity';
