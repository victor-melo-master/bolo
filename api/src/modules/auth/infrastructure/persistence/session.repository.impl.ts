// src/modules/auth/infrastructure/persistence/session.repository.impl.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * SessionRepositoryImpl — Implementación de SessionRepositoryPort (TypeORM)
 * ═══════════════════════════════════════════════════════════════
 *
 * Implementación del puerto de repositorio de sesiones usando TypeORM.
 * Provee métodos para gestionar sesiones de autenticación, incluyendo
 * creación, búsqueda por usuario/cliente y desactivación masiva.
 *
 * Capa: Infraestructura (auth)
 * Dependencias:
 *   - SessionOrmEntity: entidad TypeORM para tabla auth.sessions
 *   - Repository<SessionOrmEntity>: repositorio TypeORM inyectado
 *
 * @module SessionRepositoryImpl
 */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan } from 'typeorm';
import { Repository } from 'typeorm';
import { SessionRepositoryPort } from '../../domain/interfaces/repositories/session.repository.port';
import { Session } from '../../domain/entities/session.entity';
import { SessionOrmEntity } from '../orm/session.orm-entity';
import { Redis } from 'ioredis';

@Injectable()
export class SessionRepositoryImpl implements SessionRepositoryPort {
  constructor(
    @InjectRepository(SessionOrmEntity)
    private readonly ormRepo: Repository<SessionOrmEntity>,
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async save(session: Session): Promise<Session> {
    const orm = this.toOrm(session);
    const saved = await this.ormRepo.save(orm);
    return this.toDomain(saved);
  }

  async findActiveByUserAndClient(
    userId: string,
    userType: string,
    clientType: string,
  ): Promise<Session | null> {
    const orm = await this.ormRepo.findOne({
      where: {
        userId,
        userType: userType as any,
        clientType: clientType as any,
        isActive: true,
      },
    });
    return orm ? this.toDomain(orm) : null;
  }

  async deactivateAllForUser(userId: string, userType: string): Promise<void> {
    // 1. Obtener las sesiones activas antes de desactivarlas (para borrar sus claves)
    const activeSessions = await this.ormRepo.find({
      where: { userId, userType: userType as any, isActive: true },
    });

    if (activeSessions.length === 0) return;

    // 2. Desactivar en BD
    await this.ormRepo.update(
      { userId, userType: userType as any, isActive: true },
      { isActive: false },
    );

    // 3. Eliminar las claves de Redis para cada sesión desactivada
    const pipeline = this.redis.pipeline();
    activeSessions.forEach((s) => pipeline.del(`session:${s.id}`));
    await pipeline.exec();
  }

  private toDomain(orm: SessionOrmEntity): Session {
    return new Session(
      orm.id,
      orm.userId,
      orm.userType,
      orm.clientType,
      orm.jwtKey,
      orm.expiresAt,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(session: Session): SessionOrmEntity {
    const orm = new SessionOrmEntity();
    orm.id = session.id;
    orm.userId = session.userId;
    orm.userType = session.userType;
    orm.clientType = session.clientType;
    orm.jwtKey = session.jwtKey;
    orm.expiresAt = session.expiresAt;
    orm.isActive = session.isActive;
    orm.createdAt = session.createdAt;
    orm.updatedAt = session.updatedAt;
    return orm;
  }

  async findById(id: string): Promise<Session | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async deactivateExpired(): Promise<void> {
    await this.ormRepo.update(
      { isActive: true, expiresAt: LessThan(new Date()) },
      { isActive: false },
    );
  }
}
