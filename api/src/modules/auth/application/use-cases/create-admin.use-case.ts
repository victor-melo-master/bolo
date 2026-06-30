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
 *
 * @module CreateAdminUseCase
 */

import { Injectable, Inject, Optional } from '@nestjs/common';
import { WALLET_SERVICE_PORT } from '../../../fin/domain/interfaces/services/wallet.service.port';
import type { WalletServicePort } from '../../../fin/domain/interfaces/services/wallet.service.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { Admin, AdminRole } from '../../domain/entities/admin.entity';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces';
import type { AdminRepositoryPort } from '../../domain/interfaces';
import { CreateAdminDto } from '../dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class CreateAdminUseCase {
  private readonly logger = new Logger(CreateAdminUseCase.name); // ✅ aquí

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
    const existingPhone = await this.adminRepo.findByPhone(dto.phone);
    if (existingPhone) {
      throw new UserAlreadyExistsException('El teléfono ya está registrado');
    }

    // 1b. Validar unicidad del email (si se proporciona)
    if (dto.email) {
      const existingEmail = await this.adminRepo.findByEmail(dto.email);
      if (existingEmail) {
        throw new UserAlreadyExistsException('El email ya está registrado');
      }
    }

    // 1c. Validar unicidad de la cédula (si se proporciona)
    if (dto.cedula) {
      const existingCedula = await this.adminRepo.findByCedula(dto.cedula);
      if (existingCedula) {
        throw new UserAlreadyExistsException('La cédula ya está registrada');
      }
    }
    // 2. Hashear la contraseña
    const hashedPassword = await this.cryptoService.hash(dto.password);

    // 3. Crear entidad de dominio
    const admin = Admin.create({
      phone: dto.phone,
      email: dto.email?.toLocaleLowerCase(),
      passwordHash: hashedPassword,
      fullName: dto.fullName,
      cedula: dto.cedula,
      role: dto.role as AdminRole,
      associationId: dto.associationId,
    });

    // 4. Persistir
    const saved = await this.adminRepo.save(admin);

    // 5. Crear billetera asociada (side effect opcional)
    if (this.walletService) {
      try {
        await this.walletService.createWallet(saved.id);
      } catch (error) {
        this.logger.error(
          'Wallet creation failed, continuing admin registration',
          error,
        );
      }
    }

    return saved;
  }
}
