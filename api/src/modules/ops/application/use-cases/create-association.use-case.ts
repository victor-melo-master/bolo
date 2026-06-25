// ops/application/use-cases/create-association.use-case.ts
import {
  Injectable,
  Inject,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ASSOCIATION_REPOSITORY_PORT } from '../../../auth/domain/interfaces';
import type { AssociationRepositoryPort } from '../../../auth/domain/interfaces';
import { USER_REPOSITORY_PORT } from '../../../auth/domain/interfaces';
import type { UserRepositoryPort } from '../../../auth/domain/interfaces';
import { Association } from '../../../auth/domain/entities';
import { CreateAssociationDto } from '../dto/create-association.dto';

@Injectable()
export class CreateAssociationUseCase {
  constructor(
    @Inject(ASSOCIATION_REPOSITORY_PORT)
    private readonly associationRepo: AssociationRepositoryPort,
    @Inject(USER_REPOSITORY_PORT) private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(
    adminId: string,
    dto: CreateAssociationDto,
  ): Promise<Association> {
    // 1. Verificar que el admin existe
    const admin = await this.userRepo.findById(adminId);
    if (!admin) throw new ForbiddenException('Admin no encontrado');
    if (admin.role !== 'association_admin')
      throw new ForbiddenException(
        'Solo association_admin puede crear asociaciones',
      );
    if (admin.associationId)
      throw new ConflictException('Ya perteneces a una asociación');

    // 2. Verificar RIF duplicado
    const existing = await this.associationRepo.findByRif(dto.rif);
    if (existing) throw new ConflictException('El RIF ya está registrado');

    // 3. Crear la asociación
    const association = Association.create({
      name: dto.name,
      rif: dto.rif,
      address: dto.address as string,
      phone: dto.phone as string,
      adminId: admin.id,
      isActive: true,
    });

    // 4. Guardar la asociación
    const saved = await this.associationRepo.save(association);

    // 5. Actualizar el admin con el nuevo associationId
    await this.userRepo.updateAssociationId(adminId, saved.id);

    return saved;
  }
}
