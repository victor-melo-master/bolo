// src/modules/fin/infrastructure/persistence/coop-fare.repository.impl.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CoopFareRepositoryImpl — Implementación TypeORM del Puerto CoopFareRepositoryPort
 * ═══════════════════════════════════════════════════════════════
 *
 * Implementa el puerto de repositorio CoopFareRepositoryPort usando
 * TypeORM como mecanismo de persistencia.
 *
 * findByCooperativeId() retorna la tarifa activa de una cooperativa.
 * Se asume que solo una tarifa está activa por cooperativa.
 *
 * Capa: Infraestructura (fin/persistence)
 *
 * @see CoopFareRepositoryPort
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoopFareRepositoryPort } from '../../domain/interfaces/repositories/coop-fare.repository.port';
import { CoopFare } from '../../domain/entities/coop-fare.entity';
import { CoopFareOrmEntity } from '../orm/coop-fare.orm-entity';

@Injectable()
export class CoopFareRepositoryImpl implements CoopFareRepositoryPort {
  constructor(
    @InjectRepository(CoopFareOrmEntity)
    private readonly repo: Repository<CoopFareOrmEntity>,
  ) {}

  async findById(id: string): Promise<CoopFare | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  // Retorna la tarifa activa de una cooperativa
  async findByCooperativeId(cooperativeId: string): Promise<CoopFare | null> {
    const entity = await this.repo.findOne({ where: { cooperativeId, active: true } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(fare: CoopFare): Promise<CoopFare> {
    const entity = this.toOrm(fare);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, fare: Partial<CoopFare>): Promise<CoopFare> {
    await this.repo.update(id, this.toOrm(fare as CoopFare));
    return this.findById(id) as Promise<CoopFare>;
  }

  private toDomain(entity: CoopFareOrmEntity): CoopFare {
    return new CoopFare(
      entity.id,
      entity.cooperativeId,
      entity.name,
      Number(entity.baseFare),
      Number(entity.perKmRate),
      entity.currency,
      entity.active,
      entity.version,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toOrm(domain: CoopFare): CoopFareOrmEntity {
    const entity = new CoopFareOrmEntity();
    entity.id = domain.id;
    entity.cooperativeId = domain.cooperativeId;
    entity.name = domain.name;
    entity.baseFare = domain.baseFare;
    entity.perKmRate = domain.perKmRate;
    entity.currency = domain.currency;
    entity.active = domain.active;
    entity.version = domain.version;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
