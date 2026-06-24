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

// src/modules/auth/infrastructure/auth/jwt.strategy.ts
import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { USER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/user.repository.port';
import type { UserRepositoryPort } from '../../domain/interfaces/repositories/user.repository.port';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: UserRepositoryPort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (request, rawJwtToken: string, done) => {
        this.resolveSecretKey(rawJwtToken)
          .then((key) => done(null, key))
          .catch((err) => done(err));
      },
    });
  }

  private async resolveSecretKey(rawJwtToken: string): Promise<string> {
    const payload = JSON.parse(
      Buffer.from(rawJwtToken.split('.')[1], 'base64').toString(),
    );
    const userId: string = payload.sub;
    if (!userId) {
      throw new Error('Token sin sub');
    }

    // Unsafe argument of type `any` assigned to a parameter of type `string`.
    const user = await this.userRepo.findById(userId);
    if (!user || !user.jwtKey) {
      throw new Error('Usuario no encontrado o sin llave');
    }

    return user.jwtKey;
  }

  // Sin async porque no hay operación asíncrona
  validate(payload: any) {
    return { userId: payload.sub, phone: payload.phone, role: payload.role };
  }
}
