// auth/application/use-cases/get-admin-profile.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * GetAdminProfileUseCase — Obtener perfil de administrador
 * ═══════════════════════════════════════════════════════════════
 *
 * Recupera los datos públicos del perfil de un administrador por su ID.
 * Lanza NotFoundException si el admin no existe.
 *
 * Capa: Aplicación (auth)
 * Dependencias:
 *   - AdminRepositoryPort: persistencia de admins
 *
 * @module GetAdminProfileUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import type { AdminRepositoryPort } from '../../domain/interfaces/repositories/admin.repository.port';

@Injectable()
export class GetAdminProfileUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY_PORT)
    private readonly adminRepo: AdminRepositoryPort,
  ) {}

  async execute(adminId: string) {
    const admin = await this.adminRepo.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin no encontrado');
    }
    return {
      id: admin.id,
      phone: admin.phone,
      email: admin.email,
      fullName: admin.fullName,
      cedula: admin.cedula,
      role: admin.role,
      associationId: admin.associationId,
      qrCode: admin.qrCode,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
    };
  }
}
