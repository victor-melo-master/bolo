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
    // AssociationOrmEntity, registrado por TypeOrmModule.forFeature en
    // auth.module.ts. El contenedor DI de NestJS resuelve la dependencia
    // automáticamente gracias al decorador.
    @InjectRepository(AssociationOrmEntity)
    private readonly associationRepository: Repository<AssociationOrmEntity>,
  ) {}

  // save: recibe una entidad de dominio Association, la convierte a ORM,
  // la persiste con TypeORM, y retorna la entidad de dominio resultante.
  // El patrón toDomain/toOrm aísla al dominio de TypeORM: si se migra
  // a otro ORM, solo cambian estos mappers y los decoradores de las
  // ORM entities; el dominio y los casos de uso no se modifican.
  async save(association: Association): Promise<Association> {
    const ormAssociation = this.toOrm(association);
    const savedOrm = await this.associationRepository.save(ormAssociation);
    return this.toDomain(savedOrm);
  }

  // findById: busca una asociación por su UUID. Retorna null si no existe,
  // en lugar de lanzar excepción, para que el caso de uso decida cómo
  // manejar el "no encontrado" (ej. lanzar NotFoundException o crear una).
  async findById(id: string): Promise<Association | null> {
    const ormAssociation = await this.associationRepository.findOne({
      where: { id },
    });
    return ormAssociation ? this.toDomain(ormAssociation) : null;
  }

  // findByRif: busca una asociación por su RIF (Registro de Información
  // Fiscal venezolano). Útil para validar duplicados al registrar y para
  // búsquedas administrativas. El RIF tiene unique constraint en la BD.
  async findByRif(rif: string): Promise<Association | null> {
    const ormAssociation = await this.associationRepository.findOne({
      where: { rif },
    });
    return ormAssociation ? this.toDomain(ormAssociation) : null;
  }

  // ─── Mapeo Association → AssociationOrmEntity (dominio → ORM) ───
  // Copia cada campo de la entidad de dominio a la entidad ORM propiedad
  // por propiedad. La asignación manual es intencional: el dominio y la
  // ORM evolucionan independientemente, y el mapper las sincroniza.
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

  // ─── Mapeo AssociationOrmEntity → Association (ORM → dominio) ───
  // Construye una nueva entidad de dominio Association a partir de la ORM.
  // El constructor recibe todos los campos posicionalmente, forzando el
  // mapeo explícito de cada propiedad para evitar desincronización.
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
