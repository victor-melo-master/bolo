// auth/application/use-cases/get-admin-profile.use-case.ts
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
