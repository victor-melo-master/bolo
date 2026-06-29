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
 *   - UserRole: enum de roles del módulo auth
 *
 * @module RolesGuard
 */

// ─── Importaciones de NestJS y del proyecto ───
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'; // Injectable, CanActivate (interfaz), ExecutionContext (contexto de ejecución)
import { Reflector } from '@nestjs/core'; // Reflector: accede a metadatos almacenados por decoradores @SetMetadata
import { ROLES_KEY } from '../../../shared/interfaces/decorators/roles.decorator'; // Clave para leer roles desde metadatos del manejador
import { AdminRole } from '../../../modules/auth/domain/entities/admin.entity';; // Enum de roles de usuario (admin, super_admin, conductor, socio)

// Decorador @Injectable() permite que NestJS inyecte este guard en el contenedor IoC
@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector se inyecta para leer metadatos de roles de los manejadores de ruta
  constructor(private reflector: Reflector) {}

  // Método obligatorio de CanActivate: retorna true si permite acceso, false si deniega
  canActivate(context: ExecutionContext): boolean {
    // Lee los roles requeridos desde los metadatos del manejador (método) o la clase (controlador)
    // getAllAndOverride busca primero en el método, y si no encuentra, en la clase
    const requiredRoles = this.reflector.getAllAndOverride<AdminRole[]>(
      ROLES_KEY, // Clave definida en roles.decorator.ts ('roles')
      [context.getHandler(), context.getClass()], // Busca en método y clase
    );
    // Extrae el objeto user del request HTTP (inyectado por Passport tras validar el JWT)
    const { user } = context.switchToHttp().getRequest();

    // 🔥 LOG TEMPORAL PARA DEPURAR — se eliminará en producción
    console.log(
      'DEBUG RolesGuard — requiredRoles:',
      requiredRoles,
      'user:',
      user,
    );

    // Si no hay roles definidos en la ruta, se permite el acceso (ruta pública dentro del módulo)
    if (!requiredRoles) {
      return true;
    }
    // Verifica que el usuario tenga al menos uno de los roles requeridos (comparación de enum)
    // Si user es undefined (no autenticado), user?.role es undefined y no coincidirá con ningún rol
    return requiredRoles.some((role) => user?.role === role);
  }
}
