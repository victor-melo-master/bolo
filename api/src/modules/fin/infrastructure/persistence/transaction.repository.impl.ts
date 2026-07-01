// src/modules/fin/infrastructure/persistence/transaction.repository.impl.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * TransactionRepositoryImpl — Implementación TypeORM del Puerto TransactionRepositoryPort
 * ═══════════════════════════════════════════════════════════════
 *
 * Implementa el puerto de repositorio TransactionRepositoryPort usando
 * TypeORM como mecanismo de persistencia.
 *
 * Mapea entre la entidad de dominio Transaction y la entidad ORM
 * TransactionOrmEntity mediante los métodos privados toDomain() y toOrm().
 *
 * Capa: Infraestructura (fin/persistence)
 *
 * @see TransactionRepositoryPort
 * @module TransactionRepositoryImpl
 */

// ─── Importaciones de NestJS y TypeORM ───
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// ─── Puertos de dominio ───
import { TransactionRepositoryPort } from '../../domain/interfaces/repositories/transaction.repository.port';

// ─── Entidades de dominio ───
import {
  Transaction,
  TransactionStatus,
  TransactionType,
} from '../../domain/entities/transaction.entity';

// ─── Entidades ORM ───
import { TransactionOrmEntity } from '../orm/transaction.orm-entity';

@Injectable()
export class TransactionRepositoryImpl implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionOrmEntity) // Inyecta el repositorio TypeORM específico para la entidad TransactionOrmEntity
    private readonly repo: Repository<TransactionOrmEntity>,
  ) {}

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByWalletId(walletId: string): Promise<Transaction[]> {
    const entities = await this.repo.find({ where: { walletId } });
    return entities.map((e) => this.toDomain(e));
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const entity = this.toOrm(transaction);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(
    id: string,
    transaction: Partial<Transaction>,
  ): Promise<Transaction> {
    const orm = this.toOrm(transaction as Transaction);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  // Convierte de entidad ORM a entidad de dominio (sentido BD → aplicación)
  // Los tipos enum se castean porque TypeORM los maneja como strings en la BD
  private toDomain(entity: TransactionOrmEntity): Transaction {
    return new Transaction(
      entity.id,
      entity.walletId,
      entity.type as unknown as TransactionType, // Cast del enum ORM al enum de dominio
      Number(entity.amount), // BIGINT de SQL → number de TS
      entity.currency,
      entity.status as unknown as TransactionStatus,
      entity.referenceId,
      entity.description,
      entity.metadata,
      entity.version,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  // Convierte de entidad de dominio a entidad ORM (sentido aplicación → BD)
  // Se usa `as any` para evitar conflictos de tipos entre los enum paralelos
  private toOrm(domain: Transaction): TransactionOrmEntity {
    const entity = new TransactionOrmEntity();
    entity.id = domain.id;
    entity.walletId = domain.walletId;
    entity.type = domain.type as any; // Cast del enum de dominio al enum ORM
    entity.amount = domain.amount;
    entity.currency = domain.currency;
    entity.status = domain.status as any;
    entity.referenceId = domain.referenceId;
    entity.description = domain.description;
    entity.metadata = domain.metadata;
    entity.version = domain.version;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
