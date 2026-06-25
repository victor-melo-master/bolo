// fin/infrastructure/persistence/exchange-rate.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExchangeRateRepositoryPort } from '../../domain/interfaces/repositories/exchange-rate.repository.port';
import { ExchangeRate } from '../../domain/entities/exchange-rate.entity';
import { ExchangeRateOrmEntity } from '../orm/exchange-rate.orm-entity';

@Injectable()
export class ExchangeRateRepositoryImpl implements ExchangeRateRepositoryPort {
  constructor(
    @InjectRepository(ExchangeRateOrmEntity)
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
