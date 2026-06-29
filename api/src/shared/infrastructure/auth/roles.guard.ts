// src/shared/infrastructure/auth/roles.guard.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * RolesGuard — Guard de Control de Acceso por Roles
 * ═══════════════════════════════════════════════════════════════
 *
 * Guard de NestJS que verifica que el usuario autenticado posea al
 * menos uno de los roles requeridos para acceder a una ruta protegida.
 * Los roles se definen mediante el decorador @Roles() y se almacenan
 * como metadatos en el manejador de ruta o controlador.
 *
 * Flujo:
 *   1. El decorador @Roles('admin', 'super_admin') asigna metadatos
 *      bajo la clave ROLES_KEY
 *   2. Este guard lee esos metadatos con Reflector
 *   3. Extrae el usuario del request (inyectado por Passport tras JWT)
 *   4. Si no hay roles requeridos → permite acceso (true)
 *   5. Si hay roles requeridos → verifica que el usuario tenga al menos uno
 *
 * Capa: Infraestructura (shared/auth) — Guard
 * Dependencias:
 *   - Reflector: lee metadatos de NestJS
 *   - ROLES_KEY: clave de metadatos definida en roles.decorator
 *   - AdminRole: enum de roles del módulo auth
 *
 * @module RolesGuard
 */

// ─── Importaciones de NestJS y del proyecto ───
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../shared/interfaces/decorators/roles.decorator';
import { AdminRole } from '../../../modules/auth/domain/entities/admin.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const { user } = context.switchToHttp().getRequest();

    // Log de depuración (usar JSON.stringify para arrays)
    this.logger.debug(
      `requiredRoles: ${JSON.stringify(requiredRoles)}, user: ${JSON.stringify(user)}`,
    );

    if (!requiredRoles) {
      return true;
    }
    return requiredRoles.some((role) => user?.role === role);
  }
}
