// src/shared/infrastructure/decorators/roles.decorator.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Roles Decorator — Asignación de Roles en Rutas Protegidas
 * ═══════════════════════════════════════════════════════════════
 *
 * Decorador personalizado que almacena los roles permitidos como
 * metadatos en el manejador de ruta o controlador. Se usa junto
 * con RolesGuard para verificar que el usuario autenticado tenga
 * al menos uno de los roles especificados.
 *
 * Uso:
 *   @Roles(UserRole.ADMIN)
 *   @Get('admin-only')
 *   endpoint() { ... }
 *
 * Capa: Infraestructura (shared/decorators) — Decorador de metadatos
 * Dependencias:
 *   - SetMetadata: función de NestJS para asignar metadatos a rutas/controladores
 *   - UserRole: enum del módulo auth con los roles del sistema
 *
 * @module Roles (infrastructure decorator)
 * @see ROLES_KEY
 */

// ─── Importaciones ───
import { SetMetadata } from '@nestjs/common'; // SetMetadata asigna pares clave-valor en los metadatos del manejador
import { AdminRole } from '../../../modules/auth/domain/entities/admin.entity'; // Enum UserRole: define los roles permitidos del sistema

// Clave única bajo la cual se almacenan los roles en los metadatos del manejador
// Se usa tanto en este decorador (SetMetadata) como en RolesGuard (Reflector.get)
export const ROLES_KEY = 'roles';

// Decorador de método/clase: asigna la lista de roles permitidos a un endpoint o controlador
// RolesGuard leerá estos metadatos en tiempo de ejecución para autorizar o denegar la petición
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
