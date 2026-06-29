import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassengerRepositoryPort } from '../../domain/interfaces/repositories/passenger.repository.port';
import { Passenger } from '../../domain/entities/passenger.entity';
import { PassengerOrmEntity } from '../orm/passenger.orm-entity';

@Injectable()
export class PassengerRepositoryImpl implements PassengerRepositoryPort {
  constructor(
    @InjectRepository(PassengerOrmEntity)
    private readonly ormRepo: Repository<PassengerOrmEntity>,
  ) {}

  async findByPhone(phone: string): Promise<Passenger | null> {
    const orm = await this.ormRepo.findOne({ where: { phone } });
    return orm ? this.toDomain(orm) : null;
  }

  async save(passenger: Passenger): Promise<Passenger> {
    const orm = this.toOrm(passenger);
    const saved = await this.ormRepo.save(orm);
    return this.toDomain(saved);
  }

  async updateJwtKey(passengerId: string, jwtKey: string): Promise<void> {
    await this.ormRepo.update(passengerId, { jwtKey });
  }

  private toDomain(orm: PassengerOrmEntity): Passenger {
    return new Passenger(
      orm.id,
      orm.phone,
      orm.email,
      orm.passwordHash,
      orm.fullName,
      orm.cedula,
      orm.jwtKey,
      orm.category,
      orm.studentDocApproved,
      orm.isActive,
      orm.deletedAt,
      orm.lastLoginAt,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(passenger: Passenger): PassengerOrmEntity {
    const orm = new PassengerOrmEntity();
    orm.id = passenger.id;
    orm.phone = passenger.phone;
    orm.email = passenger.email;
    orm.passwordHash = passenger.passwordHash;
    orm.fullName = passenger.fullName;
    orm.cedula = passenger.cedula;
    orm.jwtKey = passenger.jwtKey;
    orm.category = passenger.category;
    orm.studentDocApproved = passenger.studentDocApproved;
    orm.isActive = passenger.isActive;
    orm.deletedAt = passenger.deletedAt;
    orm.lastLoginAt = passenger.lastLoginAt;
    orm.createdAt = passenger.createdAt;
    orm.updatedAt = passenger.updatedAt;
    return orm;
  }

  async findById(id: string): Promise<Passenger | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async softDelete(passengerId: string): Promise<void> {
    await this.ormRepo.update(passengerId, {
      isActive: false,
      deletedAt: new Date(),
    });
  }

  async findByEmail(email: string): Promise<Passenger | null> {
    const orm = await this.ormRepo.findOne({ where: { email } });
    return orm ? this.toDomain(orm) : null;
  }

  async findByCedula(cedula: string): Promise<Passenger | null> {
    const orm = await this.ormRepo.findOne({ where: { cedula } });
    return orm ? this.toDomain(orm) : null;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.ormRepo.update(userId, { lastLoginAt: new Date() });
  }
}
