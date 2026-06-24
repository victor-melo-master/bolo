// src/modules/auth/application/use-cases/login.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * LoginUseCase — Caso de Uso: Inicio de Sesión
 * ═══════════════════════════════════════════════════════════════
 *
 * Orquesta la autenticación de usuarios:
 *   1. Busca usuario por número telefónico
 *   2. Verifica la contraseña contra el hash almacenado
 *   3. Verifica que el usuario esté activo (isActive = true)
 *   4. Genera y firma un JWT con sub, phone y role
 *   5. Retorna token + datos básicos del usuario
 *
 * Dependencias inyectadas:
 *   - UserRepositoryPort: para buscar el usuario
 *   - CryptoService: para comparar contraseñas
 *   - JwtService: para firmar el token JWT
 *
 * Capa: Aplicación (auth) — Caso de uso
 *
 * @module LoginUseCase
 */

import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/user.repository.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import type { UserRepositoryPort } from '../../domain/interfaces/repositories/user.repository.port';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { randomUUID } from 'crypto';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: UserRepositoryPort,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
  ) {}

  async execute(
    phone: string,
    password: string,
  ): Promise<{ accessToken: string; user: any }> {
    // 1 - Find user by phone
    const user = await this.userRepo.findByPhone(phone);
    if (!user) {
      throw new InvalidCredentialsException('Invalid credentials');
    }
    // 2 - Verify password
    const isValid = await this.cryptoService.compare(
      password,
      user.passwordHash,
    );
    if (!isValid) {
      throw new InvalidCredentialsException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new InvalidCredentialsException('User is inactive');
    }

    // 3. Rotación de llave: generar una nueva llave y guardarla
    const newJwtKey = randomUUID(); // o crypto.randomUUID()
    await this.userRepo.updateJwtKey(user.id, newJwtKey);

    // 4. Construir payload con la nueva llave
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    // 5. Firmar token con la nueva llave
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
