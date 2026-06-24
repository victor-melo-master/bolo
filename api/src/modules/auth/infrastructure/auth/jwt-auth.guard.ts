// src/modules/auth/infrastructure/auth/jwt-auth.guard.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * JwtAuthGuard — Guard de Autenticación JWT
 * ═══════════════════════════════════════════════════════════════
 *
 * Guard de NestJS que protege rutas requiriendo un token JWT válido.
 * Delega la validación en JwtStrategy (Passport).
 *
 * Uso:
 *   @UseGuards(JwtAuthGuard)
 *   @Get('profile')
 *   getProfile(@Request() req) { return req.user; }
 *
 * Capa: Infraestructura (auth)
 *
 * @module JwtAuthGuard
 * @see JwtStrategy
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Injectable: registra la clase en el contenedor DI de NestJS para
// que pueda ser inyectada en controladores o usada con @UseGuards
@Injectable()
// AuthGuard('jwt') es un guard genérico de Passport que busca la
// estrategia registrada con el nombre 'jwt' (JwtStrategy) y delega
// la validación del token en ella. Al extenderlo sin agregar lógica
// adicional, JwtAuthGuard hereda todo el flujo de autenticación JWT:
// extraer token del header, verificar firma, y poblar req.user.
export class JwtAuthGuard extends AuthGuard('jwt') {}
