// auth/application/use-cases/delete-admin.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * DeleteAdminUseCase — Eliminación lógica de administrador
 * ═══════════════════════════════════════════════════════════════
 *
 * Realiza un soft-delete de un administrador: lo marca como eliminado
 * lógicamente (deletedAt) y lo desactiva. Lanza NotFoundException si
 * el admin no existe.
 *
 * Capa: Aplicación (auth)
 * Dependencias:
 *   - AdminRepositoryPort: persistencia de admins
 *
 * @module DeleteAdminUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import type { AdminRepositoryPort } from '../../domain/interfaces/repositories/admin.repository.port';

@Injectable()
export class DeleteAdminUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY_PORT)
    private readonly adminRepo: AdminRepositoryPort,
  ) {}

  async execute(adminId: string): Promise<void> {
    const admin = await this.adminRepo.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin no encontrado');
    }
    await this.adminRepo.softDelete(adminId);
  }
}
