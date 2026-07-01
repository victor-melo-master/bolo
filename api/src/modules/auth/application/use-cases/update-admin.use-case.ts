// auth/application/use-cases/update-admin.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * UpdateAdminUseCase — Actualización de administrador
 * ═══════════════════════════════════════════════════════════════
 *
 * Actualiza los datos editables de un administrador (email, fullName,
 * cedula). Lanza NotFoundException si el admin no existe.
 * Previene mass assignment asignando explícitamente solo los campos permitidos.
 *
 * Capa: Aplicación (auth)
 * Dependencias:
 *   - AdminRepositoryPort: persistencia de admins
 *
 * @module UpdateAdminUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import type { AdminRepositoryPort } from '../../domain/interfaces/repositories/admin.repository.port';
import { UpdateAdminDto } from '../dto/update-admin.dto';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';

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

    // Validar que el nuevo email no esté en uso por otro admin
    if (dto.email && dto.email !== admin.email) {
      const existingEmail = await this.adminRepo.findByEmail(dto.email);
      if (existingEmail) {
        throw new UserAlreadyExistsException(
          'El email ya está registrado por otro administrador',
        );
      }
    }

    if (dto.cedula && dto.cedula !== admin.cedula) {
      const existingCedula = await this.adminRepo.findByCedula(dto.cedula);
      if (existingCedula) {
        throw new UserAlreadyExistsException(
          'La cédula ya está registrada por otro administrador',
        );
      }
    }

    // Construir objeto solo con los campos editables (previene mass assignment, A07)
    const updatedData = {
      ...admin,
      fullName: dto.fullName !== undefined ? dto.fullName : admin.fullName,
      email: dto.email !== undefined ? dto.email : admin.email,
      cedula: dto.cedula !== undefined ? dto.cedula : admin.cedula,
      // role no se actualiza por este endpoint
    };

    const updated = await this.adminRepo.save(updatedData);

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
