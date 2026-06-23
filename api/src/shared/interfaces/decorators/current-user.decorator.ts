// src/shared/interfaces/decorators/current-user.decorator.ts
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

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
