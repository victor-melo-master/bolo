// src/modules/auth/infrastructure/auth/jwt.strategy.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * JwtStrategy — Estrategia Passport para Validación JWT
 * ═══════════════════════════════════════════════════════════════
 *
 * Estrategia de Passport que extrae el token JWT del header
 * Authorization: Bearer <token>, verifica su firma usando la
 * clave de sesión almacenada en auth.sessions, y si es válido,
 * llama a validate() para construir el objeto `user` que se
 * inyecta en req.user.
 *
 * Ahora utiliza la tabla auth.sessions para la verificación,
 * permitiendo múltiples dispositivos por usuario y revocación
 * individual de sesiones.
 *
 * Capa: Infraestructura (auth)
 * Dependencias:
 *   - AdminRepositoryPort, PassengerRepositoryPort, SessionRepositoryPort
 *   - passport-jwt: Strategy, ExtractJwt
 *
 * @module JwtStrategy
 * @see JwtAuthGuard
 */

import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import type { AdminRepositoryPort } from '../../domain/interfaces/repositories/admin.repository.port';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import type { PassengerRepositoryPort } from '../../domain/interfaces/repositories/passenger.repository.port';
import { SESSION_REPOSITORY_PORT } from '../../domain/interfaces/repositories/session.repository.port';
import type { SessionRepositoryPort } from '../../domain/interfaces/repositories/session.repository.port';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(ADMIN_REPOSITORY_PORT)
    private readonly adminRepo: AdminRepositoryPort,
    @Inject(PASSENGER_REPOSITORY_PORT)
    private readonly passengerRepo: PassengerRepositoryPort,
    @Inject(SESSION_REPOSITORY_PORT)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken, done) => {
        this.resolveSecretKey(rawJwtToken)
          .then((key) => done(null, key))
          .catch((err) => {
            console.error('ERROR en secretOrKeyProvider:', err);
            done(err);
          });
      },
    });
  }

  private async resolveSecretKey(rawJwtToken: string): Promise<string> {
    const payload = JSON.parse(
      Buffer.from(rawJwtToken.split('.')[1], 'base64url').toString(),
    );
    const userId = payload.sub;
    const sessionId = payload.sessionId;

    if (!userId || !sessionId) {
      throw new Error('Token inválido: falta userId o sessionId');
    }

    // Buscar la sesión activa
    const session = await this.sessionRepo.findById(sessionId);
    if (!session || !session.isActive) {
      throw new Error('Sesión no encontrada o inactiva');
    }

    return session.jwtKey;
  }

  validate(payload: any) {
    return {
      userId: payload.sub,
      phone: payload.phone,
      role: payload.role,
      userType: payload.userType || 'admin',
      sessionId: payload.sessionId,
    };
  }
}
