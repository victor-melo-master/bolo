import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SagaStateRepositoryPort } from '../../domain/interfaces/repositories/saga-state.repository.port';
import { SagaState } from '../../domain/entities/saga-state.entity';
import { SagaStateOrmEntity } from '../orm/saga-state.orm-entity';

@Injectable()
export class SagaStateRepositoryImpl implements SagaStateRepositoryPort {
  constructor(
    @InjectRepository(SagaStateOrmEntity)
    private readonly repo: Repository<SagaStateOrmEntity>,
  ) {}

  async findById(id: string): Promise<SagaState | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findBySagaId(sagaId: string): Promise<SagaState[]> {
    const entities = await this.repo.find({ where: { sagaId } });
    return entities.map((e) => this.toDomain(e));
  }

  async save(state: SagaState): Promise<SagaState> {
    const entity = this.toOrm(state);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, state: Partial<SagaState>): Promise<SagaState> {
    const orm = this.toOrm(state as SagaState);
    const saved = await this.repo.save(orm);
    return this.toDomain(saved);
  }

  private toDomain(entity: SagaStateOrmEntity): SagaState {
    return new SagaState(
      entity.id,
      entity.sagaId,
      entity.step as any,
      entity.status as any,
      entity.payload,
      entity.error,
      entity.version,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toOrm(domain: SagaState): SagaStateOrmEntity {
    const entity = new SagaStateOrmEntity();
    entity.id = domain.id;
    entity.sagaId = domain.sagaId;
    entity.step = domain.step as any;
    entity.status = domain.status as any;
    entity.payload = domain.payload;
    entity.error = domain.error;
    entity.version = domain.version;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
