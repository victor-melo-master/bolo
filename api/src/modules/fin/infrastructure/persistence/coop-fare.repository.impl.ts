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
 * @module CoopFareRepositoryImpl
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
    private readonly ormRepo: Repository<CoopFareOrmEntity>,
  ) {}

  async save(coopFare: CoopFare): Promise<CoopFare> {
    const orm = this.toOrm(coopFare);
    const saved = await this.ormRepo.save(orm);
    return this.toDomain(saved);
  }

  async findByAssociationId(associationId: string): Promise<CoopFare[]> {
    const ormList = await this.ormRepo.find({ where: { associationId } });
    return ormList.map((orm) => this.toDomain(orm));
  }

  private toDomain(orm: CoopFareOrmEntity): CoopFare {
    return new CoopFare(
      orm.id,
      orm.associationId,
      orm.name,
      orm.baseAmountUsd,
      orm.exchangeRateId,
      orm.surchargeNormal,
      orm.surchargeStudent,
      orm.surchargeElderly,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(fare: CoopFare): CoopFareOrmEntity {
    const orm = new CoopFareOrmEntity();
    orm.id = fare.id;
    orm.associationId = fare.associationId;
    orm.name = fare.name;
    orm.baseAmountUsd = fare.baseAmountUsd;
    orm.exchangeRateId = fare.exchangeRateId;
    orm.surchargeNormal = fare.surchargeNormal;
    orm.surchargeStudent = fare.surchargeStudent;
    orm.surchargeElderly = fare.surchargeElderly;
    orm.isActive = fare.isActive;
    orm.createdAt = fare.createdAt;
    orm.updatedAt = fare.updatedAt;
    return orm;
  }
}
