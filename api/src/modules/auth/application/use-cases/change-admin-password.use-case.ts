// auth/application/use-cases/change-admin-password.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * ChangeAdminPasswordUseCase — Cambio de contraseña de admin
 * ═══════════════════════════════════════════════════════════════
 *
 * Valida la contraseña actual de un administrador y la actualiza
 * por una nueva. Lanza UnauthorizedException si la contraseña actual
 * es incorrecta y NotFoundException si el admin no existe.
 *
 * Capa: Aplicación (auth)
 * Dependencias:
 *   - AdminRepositoryPort: persistencia de admins
 *   - CryptoService: hashing y comparación de contraseñas
 *
 * @module ChangeAdminPasswordUseCase
 */
import {
  Injectable,
  Inject,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import type { AdminRepositoryPort } from '../../domain/interfaces/repositories/admin.repository.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { SESSION_REPOSITORY_PORT } from '../../domain/interfaces';
import type { SessionRepositoryPort } from '../../domain/interfaces/repositories/session.repository.port';

@Injectable()
export class ChangeAdminPasswordUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY_PORT)
    private readonly adminRepo: AdminRepositoryPort,
    private readonly cryptoService: CryptoService,
    @Inject(SESSION_REPOSITORY_PORT)
    private readonly sessionRepo: SessionRepositoryPort,
  ) {}

  async execute(adminId: string, dto: ChangePasswordDto): Promise<void> {
    const admin = await this.adminRepo.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin no encontrado');
    }

    if (dto.newPassword !== dto.newPasswordConfirmation) {
      throw new BadRequestException('Las contraseñas nuevas no coinciden');
    }

    const isCurrentValid = await this.cryptoService.compare(
      dto.currentPassword,
      admin.passwordHash,
    );
    if (!isCurrentValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const newHash = await this.cryptoService.hash(dto.newPassword);
    await this.adminRepo.save({
      ...admin,
      passwordHash: newHash,
    });

    // Invalidar todas las sesiones activas del admin
    await this.sessionRepo.deactivateAllForUser(adminId, 'admin');
  }
}
