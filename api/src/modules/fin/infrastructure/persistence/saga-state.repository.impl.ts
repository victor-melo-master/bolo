// src/modules/fin/infrastructure/persistence/saga-state.repository.impl.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * SagaStateRepositoryImpl — Implementación TypeORM del Puerto SagaStateRepositoryPort
 * ═══════════════════════════════════════════════════════════════
 *
 * Implementa el puerto de repositorio SagaStateRepositoryPort usando
 * TypeORM como mecanismo de persistencia.
 *
 * Mapea entre la entidad de dominio SagaState y la entidad ORM
 * SagaStateOrmEntity.
 *
 * Capa: Infraestructura (fin/persistence)
 *
 * @see SagaStateRepositoryPort
 */

// ─── Importaciones de NestJS y TypeORM ───
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// ─── Puertos de dominio ───
import { SagaStateRepositoryPort } from '../../domain/interfaces/repositories/saga-state.repository.port';

// ─── Entidades de dominio ───
import {
  SagaState,
  SagaStatus,
  SagaStep,
} from '../../domain/entities/saga-state.entity';

// ─── Entidades ORM ───
import { SagaStateOrmEntity } from '../orm/saga-state.orm-entity';

@Injectable()
export class SagaStateRepositoryImpl implements SagaStateRepositoryPort {
  constructor(
    @InjectRepository(SagaStateOrmEntity) // Inyecta el repositorio TypeORM específico para SagaStateOrmEntity
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

  // Convierte de entidad ORM a entidad de dominio (sentido BD → aplicación)
  // Los enum se castean porque TypeORM los almacena como strings
  private toDomain(entity: SagaStateOrmEntity): SagaState {
    return new SagaState(
      entity.id,
      entity.sagaId,
      entity.step as unknown as SagaStep,
      entity.status as unknown as SagaStatus,
      entity.payload,
      entity.error,
      entity.version,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  // Convierte de entidad de dominio a entidad ORM (sentido aplicación → BD)
  private toOrm(domain: SagaState): SagaStateOrmEntity {
    const entity = new SagaStateOrmEntity();
    entity.id = domain.id;
    entity.sagaId = domain.sagaId;
    entity.step = domain.step as any; // Cast entre enum de dominio y enum ORM
    entity.status = domain.status as any;
    entity.payload = domain.payload;
    entity.error = domain.error;
    entity.version = domain.version;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
