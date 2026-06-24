// src/shared/interfaces/decorators/current-user.decorator.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CurrentUser — Decorator para Extraer Usuario Autenticado
 * ═══════════════════════════════════════════════════════════════
 *
 * Decorador de parámetro personalizado que extrae el objeto `user`
 * del request HTTP (inyectado por Passport tras validar el JWT).
 * Evita tener que escribir `@Request() req` y acceder a `req.user`
 * manualmente en cada controlador.
 *
 * Uso:
 *   @Get('profile')
 *   getProfile(@CurrentUser() user: JwtPayload) { ... }
 *
 * Capa: Interfaces (shared/decorators)
 *
 * @module CurrentUser
 */

// Importa el factory de decoradores de parámetro y el contexto de ejecución de NestJS
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// Decorador de parámetro que extrae el usuario autenticado del request HTTP
export const CurrentUser = createParamDecorator(
  // data: argumento opcional pasado al decorador (no usado aquí); ctx: contexto de ejecución de NestJS
  (data: unknown, ctx: ExecutionContext) => {
    // Obtiene el objeto Request de Express desde el contexto HTTP
    const request = ctx.switchToHttp().getRequest();
    // Retorna el usuario inyectado por Passport tras validar el JWT (req.user)
    return request.user;
  },
);
