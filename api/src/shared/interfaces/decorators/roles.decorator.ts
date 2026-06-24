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

// Importa la función SetMetadata de NestJS para asignar metadatos personalizados a rutas/controladores
import { SetMetadata } from '@nestjs/common';

// Clave bajo la cual se almacenan los roles permitidos en los metadatos del manejador
export const ROLES_KEY = 'roles';
// Decorador que asigna los roles permitidos a un controlador/ruta para su verificación posterior por un guard
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
