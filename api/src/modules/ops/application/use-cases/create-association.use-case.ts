// src/modules/ops/application/use-cases/create-association.use-case.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateAssociationUseCase — Creación de una nueva asociación
 * ═══════════════════════════════════════════════════════════════
 *
 * Orquesta el registro de una asociación/cooperativa de transporte.
 * Incluye validaciones críticas de negocio:
 *   1. El usuario solicitante debe existir y tener rol association_admin.
 *   2. El usuario no debe pertenecer ya a otra asociación.
 *   3. El RIF no debe estar duplicado.
 *   4. Tras crear la asociación, se actualiza el associationId del admin.
 *
 * Este caso de uso cruza dos módulos (auth y ops) para mantener
 * la consistencia entre el usuario administrador y su asociación.
 *
 * Capa: Aplicación (ops)
 *
 * @module CreateAssociationUseCase
 */

// ─── Importaciones ───

import {
  Injectable,
  Inject,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ASSOCIATION_REPOSITORY_PORT } from '../../../auth/domain/interfaces';
import type { AssociationRepositoryPort } from '../../../auth/domain/interfaces';
import { ADMIN_REPOSITORY_PORT } from '../../../auth/domain/interfaces';
import type { AdminRepositoryPort } from '../../../auth/domain/interfaces';
import { Association } from '../../../auth/domain/entities';
import { CreateAssociationDto } from '../dto/create-association.dto';

// ─── Caso de Uso ───

@Injectable()
export class CreateAssociationUseCase {
  constructor(
    @Inject(ASSOCIATION_REPOSITORY_PORT) // Puerto del repositorio de asociaciones (módulo auth)
    private readonly associationRepo: AssociationRepositoryPort,
    @Inject(ADMIN_REPOSITORY_PORT)
    private readonly adminRepo: AdminRepositoryPort,
  ) {}

  /**
   * Ejecuta la creación de una asociación.
   *
   * Proceso completo:
   *   1. Verifica que el admin existe y tiene rol 'association_admin'.
   *   2. Verifica que el admin no tenga ya una asociación asignada.
   *   3. Verifica que el RIF no esté registrado previamente.
   *   4. Crea la entidad Association con los datos del DTO.
   *   5. Persiste la asociación.
   *   6. Asigna el ID de la nueva asociación al usuario admin.
   *
   * @param adminId — UUID del usuario administrador (del token JWT)
   * @param dto — Datos validados de la asociación a crear
   * @returns Promise<Association> — La asociación recién creada
   */
  async execute(
    adminId: string,
    dto: CreateAssociationDto,
  ): Promise<Association> {
    // 1. Verificar que el admin existe y tiene permisos
    const admin = await this.adminRepo.findById(adminId);
    if (!admin) throw new ForbiddenException('Admin no encontrado');
    if (admin.role !== 'association_admin')
      throw new ForbiddenException(
        'Solo association_admin puede crear asociaciones',
      );
    if (admin.associationId)
      throw new ConflictException('Ya perteneces a una asociación');

    // 2. Verificar RIF duplicado — el RIF es único por ley en Venezuela
    const existing = await this.associationRepo.findByRif(dto.rif);
    if (existing) throw new ConflictException('El RIF ya está registrado');

    // 3. Crear la asociación usando el factory method de la entidad
    const association = Association.create({
      name: dto.name,
      rif: dto.rif,
      address: dto.address as string,
      phone: dto.phone as string,
      adminId: admin.id,
      isActive: true,
    });

    // 4. Guardar la asociación en la base de datos
    const saved = await this.associationRepo.save(association);

    // 5. Actualizar el admin con el nuevo associationId — mantiene la consistencia
    //    entre la tabla de usuarios y la de asociaciones
    await this.adminRepo.updateAssociationId(adminId, saved.id);

    return saved;
  }
}
