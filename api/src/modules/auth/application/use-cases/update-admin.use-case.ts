// auth/application/use-cases/update-admin.use-case.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import type { AdminRepositoryPort } from '../../domain/interfaces/repositories/admin.repository.port';
import { UpdateAdminDto } from '../dto/update-admin.dto';

@Injectable()
export class UpdateAdminUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY_PORT)
    private readonly adminRepo: AdminRepositoryPort,
  ) {}

  async execute(adminId: string, dto: UpdateAdminDto) {
    const admin = await this.adminRepo.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin no encontrado');
    }

    const updated = await this.adminRepo.save({
      ...admin,
      ...dto,
    });

    return {
      id: updated.id,
      phone: updated.phone,
      email: updated.email,
      fullName: updated.fullName,
      cedula: updated.cedula,
      role: updated.role,
      associationId: updated.associationId,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
    };
  }
}
