// src/modules/auth/interfaces/rest/index.ts
/**
 * Barrel exports para controladores REST del módulo auth.
 *
 * @module auth/interfaces/rest
 */

// Barrel file: re-exporta todos los controladores desde un solo punto de entrada.
// Esto permite importar cualquier controlador con:
//   import { AuthController, UserController } from './interfaces/rest';
// En lugar de importar desde archivos individuales.
export { AuthController } from './auth.controller';
export { UserController } from './user.controller';
export { AssociationController } from './association.controller';
