// auth/application/use-cases/create-admin.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateAdminUseCase — Registro de administrador/conductor
 * ═══════════════════════════════════════════════════════════════
 *
 * Orquesta la creación de un nuevo admin (driver, association_admin o super_admin):
 *   1. Valida que el teléfono no exista
 *   2. Hashea la contraseña
 *   3. Crea la entidad Admin
 *   4. Persiste en auth.admins
 *   5. Crea la wallet asociada (side effect opcional)
 *
 * Dependencias inyectadas:
 *   - AdminRepositoryPort: persistencia de admins
 *   - CryptoService: hashing de contraseñas
 *   - WalletServicePort: creación de billetera (opcional)
 *
 * Capa: Aplicación (auth)
 */

import { Injectable, Inject, Optional } from '@nestjs/common';
import { WALLET_SERVICE_PORT } from '../../../fin/domain/interfaces/services/wallet.service.port';
import type { WalletServicePort } from '../../../fin/domain/interfaces/services/wallet.service.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { Admin } from '../../domain/entities/admin.entity';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces';
import type { AdminRepositoryPort } from '../../domain/interfaces';
import { CreateAdminDto } from '../dto';

@Injectable()
export class CreateAdminUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY_PORT)
    private readonly adminRepo: AdminRepositoryPort,
    private readonly cryptoService: CryptoService,
    @Optional()
    @Inject(WALLET_SERVICE_PORT)
    private readonly walletService?: WalletServicePort,
  ) {}

  async execute(dto: CreateAdminDto): Promise<Admin> {
    // 1. Validar unicidad del teléfono
    const existing = await this.adminRepo.findByPhone(dto.phone);
    if (existing) {
      throw new UserAlreadyExistsException('El teléfono ya está registrado');
    }

    // 2. Hashear la contraseña
    const hashedPassword = await this.cryptoService.hash(dto.password);

    // 3. Crear entidad de dominio
    const admin = Admin.create({
      phone: dto.phone,
      email: dto.email,
      passwordHash: hashedPassword,
      fullName: dto.fullName,
      cedula: dto.cedula,
      role: dto.role as any,
      associationId: dto.associationId,
    });

    // 4. Persistir
    const saved = await this.adminRepo.save(admin);

    // 5. Crear billetera asociada (side effect opcional)
    if (this.walletService) {
      try {
        await this.walletService.createWallet(saved.id);
      } catch (error) {
        console.error(
          'Wallet creation failed, continuing admin registration:',
          error,
        );
      }
    }

    return saved;
  }
}
