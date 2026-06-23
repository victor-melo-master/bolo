import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssociationRepositoryPort } from '../../domain/interfaces/repositories/association.repository.port';
import { Association } from '../../domain/entities/association.entity';
import { AssociationOrmEntity } from '../orm/association.orm-entity';

@Injectable()
export class AssociationRepositoryImpl implements AssociationRepositoryPort {
  constructor(
    @InjectRepository(AssociationOrmEntity)
    private readonly associationRepository: Repository<AssociationOrmEntity>,
  ) {}

  async save(association: Association): Promise<Association> {
    const ormAssociation = this.toOrm(association);
    const savedOrm = await this.associationRepository.save(ormAssociation);
    return this.toDomain(savedOrm);
  }

  async findById(id: string): Promise<Association | null> {
    const ormAssociation = await this.associationRepository.findOne({
      where: { id },
    });
    return ormAssociation ? this.toDomain(ormAssociation) : null;
  }

  async findByRif(rif: string): Promise<Association | null> {
    const ormAssociation = await this.associationRepository.findOne({
      where: { rif },
    });
    return ormAssociation ? this.toDomain(ormAssociation) : null;
  }

  private toOrm(association: Association): AssociationOrmEntity {
    const ormAssociation = new AssociationOrmEntity();
    ormAssociation.id = association.id;
    ormAssociation.name = association.name;
    ormAssociation.rif = association.rif;
    ormAssociation.address = association.address;
    ormAssociation.phone = association.phone;
    ormAssociation.adminId = association.adminId;
    ormAssociation.isActive = association.isActive;
    return ormAssociation;
  }

  private toDomain(orm: AssociationOrmEntity): Association {
    return new Association(
      orm.id,
      orm.name,
      orm.rif,
      orm.address,
      orm.phone,
      orm.adminId,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }
}
