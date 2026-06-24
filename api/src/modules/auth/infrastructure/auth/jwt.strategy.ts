// src/modules/auth/infrastructure/auth/jwt.strategy.ts — Ruta relativa desde src/
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

import { Injectable, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { USER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/user.repository.port';
import type { UserRepositoryPort } from '../../domain/interfaces/repositories/user.repository.port';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    // Se inyecta el puerto del repositorio de usuarios para buscar
    // la clave JWT específica del usuario al verificar cada token.
    // Se usa @Inject con el token del puerto en lugar del tipo directamente
    // para respetar el desacoplamiento de Arquitectura Hexagonal.
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: UserRepositoryPort,
  ) {
    super({
      // Extrae el token JWT del header HTTP Authorization con formato Bearer
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // No permitir tokens expirados: Passport rechazará automáticamente
      // cualquier token cuya fecha de expiración (exp en el payload) haya pasado
      ignoreExpiration: false,
      // Diferencia clave: secretOrKeyProvider vs secretOrKey.
      // secretOrKey: usa una sola clave estática para verificar todos los tokens
      // (ej. secretOrKey: 'mi-clave-fija').
      // secretOrKeyProvider: función callback que resuelve la clave dinámicamente
      // por cada petición. Se usa aquí para obtener la clave JWT personalizada
      // de cada usuario desde la base de datos, permitiendo:
      //   - Clave única por usuario (jwtKey se genera en cada login)
      //   - Invalidación de sesión individual (regenerando jwtKey)
      //   - Revocación masiva (cambiando todas las jwtKey)
      secretOrKeyProvider: (request, rawJwtToken: string, done) => {
        this.resolveSecretKey(rawJwtToken)
          .then((key) => done(null, key))
          .catch((err) => done(err));
      },
    });
  }

  // Resuelve la clave secreta del usuario a partir del token JWT.
  // Decodifica el payload del token SIN verificar la firma (solo base64 → JSON),
  // extrae el ID de usuario (payload.sub), busca al usuario en BD y retorna su jwtKey.
  // Este método se ejecuta ANTES de que Passport verifique la firma: resolveSecretKey
  // solo obtiene la clave, luego Passport la usa para verificar criptográficamente
  // que el token fue firmado con esa misma clave.
  // Si el token está firmado con una clave diferente (sesión anterior), la
  // verificación criptográfica falla y Passport rechaza el token automáticamente.
  private async resolveSecretKey(rawJwtToken: string): Promise<string> {
    // Decodificación manual del payload JWT (segunda parte del token:
    // header.payload.signature). Se usa Buffer.from(... 'base64') para
    // convertir la porción codificada a string JSON, luego se parsea.
    // No hay verificación de firma en este paso.
    const payload = JSON.parse(
      Buffer.from(rawJwtToken.split('.')[1], 'base64').toString(),
    );
    // Extrae el ID de usuario del campo 'sub' (subject) del payload JWT
    const userId: string = payload.sub;
    if (!userId) {
      throw new Error('Token sin sub');
    }

    // Busca al usuario en la base de datos para obtener su jwtKey actual.
    // Si el usuario fue eliminado (soft delete) o no tiene jwtKey asignada,
    // el token no puede ser verificado y se lanza error.
    const user = await this.userRepo.findById(userId);
    if (!user || !user.jwtKey) {
      throw new Error('Usuario no encontrado o sin llave');
    }

    // Retorna la clave JWT del usuario. Passport la usará para verificar
    // la firma del token. Si no coincide (ej. sesión anterior), Passport
    // rechaza la autenticación automáticamente con error 401.
    return user.jwtKey;
  }

  // validate() se ejecuta DESPUÉS de que Passport verificó exitosamente
  // la firma del token con la clave obtenida de resolveSecretKey.
  // No es async porque es una transformación síncrona del payload decodificado.
  // El payload ya fue validado por Passport (firma, expiración), así que es
  // seguro asumir que contiene los campos esperados (sub, phone, role).
  validate(payload: any) {
    // Retorna el objeto que se inyectará en req.user en los controladores
    // protegidos. Solo se exponen los datos necesarios para la autorización:
    // identificador, teléfono y rol del usuario.
    return { userId: payload.sub, phone: payload.phone, role: payload.role };
  }
}
