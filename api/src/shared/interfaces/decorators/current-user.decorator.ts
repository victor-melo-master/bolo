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

// ─── Importaciones de NestJS ───
import { createParamDecorator, ExecutionContext } from '@nestjs/common'; // createParamDecorator: fábrica de decoradores de parámetro personalizados; ExecutionContext: contexto de ejecución de NestJS

// ─── Decorador de parámetro: @CurrentUser() ───
// Extrae el objeto `user` del request HTTP, que es inyectado por Passport.js tras
// validar exitosamente el token JWT en el guard de autenticación.
// Uso típico en controladores:
//   @Get('profile')
//   getProfile(@CurrentUser() user: JwtPayload) { ... }
export const CurrentUser = createParamDecorator(
  // data: argumento opcional pasado al decorador (ej: @CurrentUser('email') para extraer solo el email).
  // ctx: ExecutionContext proporciona acceso al contexto de ejecución (HTTP, RPC, WebSockets).
  (data: unknown, ctx: ExecutionContext) => {
    // ctx.switchToHttp() cambia al contexto HTTP para acceder a Request/Response de Express
    const request = ctx.switchToHttp().getRequest();
    // request.user es establecido por el PassportStrategy (JwtStrategy) tras validar el token.
    // Contiene el payload del JWT decodificado (id, role, email, etc.).
    return request.user;
  },
);
