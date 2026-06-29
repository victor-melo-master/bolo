import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SessionRepositoryPort } from '../../domain/interfaces/repositories/session.repository.port';
import { Session } from '../../domain/entities/session.entity';
import { SessionOrmEntity } from '../orm/session.orm-entity';

@Injectable()
export class SessionRepositoryImpl implements SessionRepositoryPort {
  constructor(
    @InjectRepository(SessionOrmEntity)
    private readonly ormRepo: Repository<SessionOrmEntity>,
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
    await this.ormRepo.update(
      { userId, userType: userType as any, isActive: true },
      { isActive: false },
    );
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
}
