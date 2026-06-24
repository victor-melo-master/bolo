// src/modules/fin/infrastructure/persistence/exchange-rate.repository.impl.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * ExchangeRateRepositoryImpl — Implementación TypeORM del Puerto ExchangeRateRepositoryPort
 * ═══════════════════════════════════════════════════════════════
 *
 * Implementa el puerto de repositorio ExchangeRateRepositoryPort usando
 * TypeORM como mecanismo de persistencia.
 *
 * findCurrent() usa LessThanOrEqual/MoreThanOrEqual para encontrar
 * la tasa vigente entre dos monedas en la fecha actual.
 *
 * Capa: Infraestructura (fin/persistence)
 *
 * @see ExchangeRateRepositoryPort
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ExchangeRateRepositoryPort } from '../../domain/interfaces/repositories/exchange-rate.repository.port';
import { ExchangeRate } from '../../domain/entities/exchange-rate.entity';
import { ExchangeRateOrmEntity } from '../orm/exchange-rate.orm-entity';

@Injectable()
export class ExchangeRateRepositoryImpl implements ExchangeRateRepositoryPort {
  constructor(
    @InjectRepository(ExchangeRateOrmEntity)
    private readonly repo: Repository<ExchangeRateOrmEntity>,
  ) {}

  // Busca la tasa vigente más reciente entre dos monedas
  async findCurrent(from: string, to: string): Promise<ExchangeRate | null> {
    const now = new Date();
    const entity = await this.repo.findOne({
      where: {
        fromCurrency: from,
        toCurrency: to,
        validFrom: LessThanOrEqual(now),
        validUntil: MoreThanOrEqual(now),
      },
      order: { validFrom: 'DESC' },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findById(id: string): Promise<ExchangeRate | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(rate: ExchangeRate): Promise<ExchangeRate> {
    const entity = this.toOrm(rate);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  private toDomain(entity: ExchangeRateOrmEntity): ExchangeRate {
    return new ExchangeRate(
      entity.id,
      entity.fromCurrency,
      entity.toCurrency,
      Number(entity.rate),
      entity.validFrom,
      entity.validUntil,
      entity.version,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toOrm(domain: ExchangeRate): ExchangeRateOrmEntity {
    const entity = new ExchangeRateOrmEntity();
    entity.id = domain.id;
    entity.fromCurrency = domain.fromCurrency;
    entity.toCurrency = domain.toCurrency;
    entity.rate = domain.rate;
    entity.validFrom = domain.validFrom;
    entity.validUntil = domain.validUntil;
    entity.version = domain.version;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
