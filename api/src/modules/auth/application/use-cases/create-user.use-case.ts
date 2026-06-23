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
    // 1. Validar reglas de negocio
    const existing = await this.userRepo.findByPhone(dto.phone);
    if (existing) {
      throw new Error('Phone already registered');
    }

    // 2. Hashear la contraseña
    const hashedPassword = await this.cryptoService.hash(dto.password);

    // 3. Crear entidad de dominio
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

    // 4. Persistir
    const savedUser = await this.userRepo.save(user);

    // 5. Crear billetera asociada (si el servicio está disponible)
    if (this.walletService) {
      await this.walletService.createWallet(savedUser.id);
    }

    return savedUser;
  }
}
