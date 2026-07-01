// src/modules/auth/interfaces/rest/index.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Barrel exports — Controladores REST del Módulo Auth
 * ═══════════════════════════════════════════════════════════════
 *
 * Centraliza las exportaciones de todos los controladores REST del
 * módulo auth (AdminAuthController, PassengerAuthController) para
 * simplificar las importaciones desde auth.module.ts.
 *
 * @module auth/interfaces/rest
 */

// Barrel file: re-exporta todos los controladores desde un solo punto de entrada.
// Esto permite importar cualquier controlador con:
//   import { AuthController, UserController } from './interfaces/rest';
// En lugar de importar desde archivos individuales.
// export { AssociationController } from './association.controller';
