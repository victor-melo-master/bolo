// src/modules/fin/infrastructure/persistence/wallet.repository.impl.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * WalletRepositoryImpl — Implementación TypeORM del Puerto WalletRepositoryPort
 * ═══════════════════════════════════════════════════════════════
 *
 * Implementa el puerto de repositorio WalletRepositoryPort usando
 * TypeORM como mecanismo de persistencia.
 *
 * Mapea entre la entidad de dominio Wallet y la entidad ORM WalletOrmEntity
 * mediante los métodos privados toDomain() y toOrm().
 *
 * Capa: Infraestructura (fin/persistence)
 *
 * @see WalletRepositoryPort
 * @module WalletRepositoryImpl
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletRepositoryPort } from '../../domain/interfaces/repositories/wallet.repository.port';
import { Wallet } from '../../domain/entities/wallet.entity';
import { WalletOrmEntity } from '../orm/wallet.orm-entity';

@Injectable()
export class WalletRepositoryImpl implements WalletRepositoryPort {
  constructor(
    @InjectRepository(WalletOrmEntity)
    private readonly repo: Repository<WalletOrmEntity>,
  ) {}

  async findById(id: string): Promise<Wallet | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    const entity = await this.repo.findOne({ where: { userId } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(wallet: Wallet): Promise<Wallet> {
    const entity = this.toOrm(wallet);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, wallet: Partial<Wallet>): Promise<Wallet> {
    await this.repo.update(id, this.toOrm(wallet as Wallet));
    return this.findById(id) as Promise<Wallet>;
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // Convierte de entidad ORM a entidad de dominio (sentido BD → aplicación)
  private toDomain(entity: WalletOrmEntity): Wallet {
    return new Wallet(
      entity.id,
      entity.userId,
      Number(entity.balance),
      Number(entity.debtBalance),
      entity.creditUsed,
      entity.currency,
      entity.lastTransactionAt,
      entity.version,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  // Convierte de entidad de dominio a entidad ORM (sentido aplicación → BD)
  private toOrm(domain: Wallet): WalletOrmEntity {
    const entity = new WalletOrmEntity();
    entity.id = domain.id;
    entity.userId = domain.userId;
    entity.balance = domain.balance;
    entity.debtBalance = domain.debtBalance;
    entity.creditUsed = domain.creditUsed;
    entity.currency = domain.currency;
    entity.lastTransactionAt = domain.lastTransactionAt;
    entity.version = domain.version;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
