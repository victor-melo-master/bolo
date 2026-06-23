// src/modules/auth/infrastructure/auth/jwt-auth.guard.ts
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

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
