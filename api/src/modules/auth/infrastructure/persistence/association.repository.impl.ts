// src/modules/auth/infrastructure/persistence/association.repository.impl.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * AssociationRepositoryImpl — Repositorio de Asociaciones (TypeORM)
 * ═══════════════════════════════════════════════════════════════
 *
 * Adaptador concreto del puerto AssociationRepositoryPort.
 * Persiste y recupera asociaciones/cooperativas en la tabla
 * auth.associations mediante TypeORM.
 *
 * Capa: Infraestructura (auth/persistence)
 *
 * @module AssociationRepositoryImpl
 * @see AssociationRepositoryPort
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssociationRepositoryPort } from '../../domain/interfaces/repositories/association.repository.port';
import { Association } from '../../domain/entities/association.entity';
import { AssociationOrmEntity } from '../orm/association.orm-entity';

@Injectable()
export class AssociationRepositoryImpl implements AssociationRepositoryPort {
  constructor(
    // @InjectRepository inyecta el repositorio TypeORM específico para
    // AssociationOrmEntity, registrado por TypeOrmModule.forFeature
    @InjectRepository(AssociationOrmEntity)
    private readonly associationRepository: Repository<AssociationOrmEntity>,
  ) {}

  // Patrón toDomain/toOrm: igual que en UserRepositoryImpl, aísla el
  // dominio de la infraestructura de persistencia. Si se cambia de ORM,
  // solo se modifican estos mappers y los decoradores de AssociationOrmEntity.
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

  // Mapeo Association → AssociationOrmEntity (dominio → ORM)
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

  // Mapeo AssociationOrmEntity → Association (ORM → dominio)
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
