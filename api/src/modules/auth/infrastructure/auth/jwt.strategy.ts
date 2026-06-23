// src/modules/auth/infrastructure/auth/jwt.strategy.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * JwtStrategy — Estrategia Passport para Validación JWT
 * ═══════════════════════════════════════════════════════════════
 *
 * Estrategia de Passport que extrae el token JWT del header
 * Authorization: Bearer <token>, verifica su firma con el secreto
 * configurado (JWT_SECRET), y si es válido, llama a validate()
 * para construir el objeto `user` que se inyecta en req.user.
 *
 * validate() retorna un objeto con userId, phone y role extraídos
 * del payload del token. Este objeto queda disponible en los
 * controladores protegidos mediante @Request() req.user o el
 * decorador @CurrentUser().
 *
 * Capa: Infraestructura (auth)
 * Dependencias:
 *   - @nestjs/passport: PassportStrategy
 *   - passport-jwt: Strategy, ExtractJwt
 *   - ConfigService: obtiene JWT_SECRET
 *
 * @module JwtStrategy
 * @see JwtAuthGuard
 */

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'defaultSecret',
    });
  }

  validate(payload: any) {
    return { userId: payload.sub, phone: payload.phone, role: payload.role };
  }
}
