import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepositoryPort } from '../../domain/interfaces/repositories/transaction.repository.port';
import { Transaction } from '../../domain/entities/transaction.entity';
import { TransactionOrmEntity } from '../orm/transaction.orm-entity';

@Injectable()
export class TransactionRepositoryImpl implements TransactionRepositoryPort {
  constructor(
    @InjectRepository(TransactionOrmEntity)
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

  private toDomain(entity: TransactionOrmEntity): Transaction {
    return new Transaction(
      entity.id,
      entity.walletId,
      entity.type as any,
      Number(entity.amount),
      entity.currency,
      entity.status as any,
      entity.referenceId,
      entity.description,
      entity.metadata,
      entity.version,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toOrm(domain: Transaction): TransactionOrmEntity {
    const entity = new TransactionOrmEntity();
    entity.id = domain.id;
    entity.walletId = domain.walletId;
    entity.type = domain.type as any;
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
