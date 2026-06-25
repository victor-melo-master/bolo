// src/shared/interfaces/decorators/roles.decorator.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Roles — Decorator para Control de Acceso por Roles
 * ═══════════════════════════════════════════════════════════════
 *
 * Decorador personalizado que asigna metadatos de roles permitidos
 * a un controlador o ruta. Se usa junto con un guard (RolesGuard)
 * para verificar que el usuario autenticado tenga uno de los roles
 * especificados.
 *
 * Uso:
 *   @Roles('admin', 'super_admin')
 *   @Get('admin-only')
 *   endpoint() { ... }
 *
 * Capa: Interfaces (shared/decorators)
 *
 * @module Roles
 * @see ROLES_KEY
 */

// ─── Importaciones de NestJS ───
import { SetMetadata } from '@nestjs/common'; // SetMetadata: asigna pares clave-valor en los metadatos del manejador de ruta

// ─── Decorador: @Roles() para control de acceso ───
// NOTA: Este decorador usa `string[]` como tipo genérico, mientras que la versión en
// infraestructura (shared/infrastructure/decorators/roles.decorator.ts) usa `UserRole[]`.
// Ambas son funcionalmente equivalentes; la de interfaces es más flexible (acepta strings),
// mientras que la de infraestructura ofrece tipado más estricto con el enum UserRole.
export const ROLES_KEY = 'roles'; // Clave única para almacenar roles en metadatos (usada por RolesGuard con Reflector.get)
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles); // Asigna los roles a la ruta/controlador
