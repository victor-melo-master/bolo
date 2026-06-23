// src/shared/interfaces/decorators/roles.decorator.ts
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

import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
