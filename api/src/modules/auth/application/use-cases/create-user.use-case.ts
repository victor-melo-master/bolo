// src/modules/auth/application/use-cases/create-user.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateUserUseCase — Caso de Uso: Registrar Usuario
 * ═══════════════════════════════════════════════════════════════
 *
 * Orquesta el registro completo de un nuevo usuario:
 *   1. Valida que el teléfono no esté registrado
 *   2. Hashea la contraseña con bcrypt (costo 10)
 *   3. Crea la entidad User mediante el método de fábrica
 *   4. Persiste mediante el repositorio
 *   5. Crea la billetera digital asociada (si WalletServicePort
 *      está disponible — actualmente es un mock)
 *
 * Dependencias inyectadas:
 *   - UserRepositoryPort (puerto de salida → UserRepositoryImpl)
 *   - CryptoService (servicio compartido de hashing)
 *   - WalletServicePort (opcional — mock hasta implementar fin)
 *
 * Capa: Aplicación (auth) — Caso de uso
 *
 * @module CreateUserUseCase
 */

import { Injectable, Inject, Optional } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../../domain/entities/user.entity';
import { USER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/user.repository.port';
import type { UserRepositoryPort } from '../../domain/interfaces/repositories/user.repository.port';
import { WALLET_SERVICE_PORT } from '../../domain/interfaces/services/wallet.service.port';
import type { WalletServicePort } from '../../domain/interfaces/services/wallet.service.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: UserRepositoryPort,
    private readonly cryptoService: CryptoService,
    @Optional()
    @Inject(WALLET_SERVICE_PORT)
    private readonly walletService?: WalletServicePort,
  ) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findByPhone(dto.phone);
    if (existing) {
      throw new Error('Phone already registered');
    }

    const hashedPassword = await this.cryptoService.hash(dto.password);

    const user = User.create({
      phone: dto.phone,
      email: dto.email ?? null,
      passwordHash: hashedPassword,
      fullName: dto.fullName,
      cedula: dto.cedula ?? null,
      role: dto.role,
      category: dto.category,
      jwtKey: null,
      qrCode: null,
      qrKey: null,
      qrVersion: 0,
      studentDocApproved: false,
      isActive: true,
      deletedAt: null,
      lastLoginAt: null,
    });

    const savedUser = await this.userRepo.save(user);

    if (this.walletService) {
      await this.walletService.createWallet(savedUser.id);
    }

    return savedUser;
  }
}
