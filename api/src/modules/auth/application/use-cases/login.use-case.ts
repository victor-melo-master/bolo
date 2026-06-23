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
    const user = await this.userRepo.findByPhone(phone);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    const isValid = await this.cryptoService.compare(
      password,
      user.passwordHash,
    );
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    if (!user.isActive) {
      throw new Error('User is inactive');
    }
    const payload = { sub: user.id, phone: user.phone, role: user.role };
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
