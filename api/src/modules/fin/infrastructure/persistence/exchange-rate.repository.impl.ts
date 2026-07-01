// src/modules/fin/infrastructure/persistence/exchange-rate.repository.impl.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * ExchangeRateRepositoryImpl — Implementación TypeORM del Puerto ExchangeRateRepositoryPort
 * ═══════════════════════════════════════════════════════════════
 *
 * Implementa el puerto de repositorio ExchangeRateRepositoryPort usando
 * TypeORM como mecanismo de persistencia.
 *
 * Mapea entre la entidad de dominio ExchangeRate y la entidad ORM
 * ExchangeRateOrmEntity.
 *
 * Capa: Infraestructura (fin/persistence)
 *
 * @see ExchangeRateRepositoryPort
 * @module ExchangeRateRepositoryImpl
 */

// ─── Importaciones de NestJS y TypeORM ───
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// ─── Puertos de dominio ───
import { ExchangeRateRepositoryPort } from '../../domain/interfaces/repositories/exchange-rate.repository.port';

// ─── Entidades de dominio ───
import { ExchangeRate } from '../../domain/entities/exchange-rate.entity';

// ─── Entidades ORM ───
import { ExchangeRateOrmEntity } from '../orm/exchange-rate.orm-entity';

@Injectable()
export class ExchangeRateRepositoryImpl implements ExchangeRateRepositoryPort {
  constructor(
    @InjectRepository(ExchangeRateOrmEntity) // Inyecta el repositorio TypeORM específico para ExchangeRateOrmEntity
    private readonly ormRepo: Repository<ExchangeRateOrmEntity>,
  ) {}

  async findById(id: string): Promise<ExchangeRate | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async save(rate: ExchangeRate): Promise<ExchangeRate> {
    const orm = this.toOrm(rate);
    const saved = await this.ormRepo.save(orm);
    return this.toDomain(saved);
  }

  // Convierte de entidad ORM a entidad de dominio (sentido BD → aplicación)
  private toDomain(orm: ExchangeRateOrmEntity): ExchangeRate {
    return new ExchangeRate(
      orm.id,
      orm.currency,
      orm.rate,
      orm.effectiveDate,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  // Convierte de entidad de dominio a entidad ORM (sentido aplicación → BD)
  private toOrm(rate: ExchangeRate): ExchangeRateOrmEntity {
    const orm = new ExchangeRateOrmEntity();
    orm.id = rate.id;
    orm.currency = rate.currency;
    orm.rate = rate.rate;
    orm.effectiveDate = rate.effectiveDate;
    orm.createdAt = rate.createdAt;
    orm.updatedAt = rate.updatedAt;
    return orm;
  }
}
