// src/modules/auth/infrastructure/persistence/user.repository.impl.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * UserRepositoryImpl — Implementación del Repositorio de Usuarios
 * ═══════════════════════════════════════════════════════════════
 *
 * Adaptador concreto del puerto UserRepositoryPort utilizando
 * TypeORM como motor de persistencia.
 *
 * Responsabilidades:
 *   - Persistir entidades User en la tabla auth.users
 *   - Recuperar usuarios por ID o número telefónico
 *   - Mapear entre entidad de dominio (User) y entidad ORM
 *     (UserOrmEntity) mediante métodos privados toDomain / toOrm
 *
 * Los mappers son necesarios porque la entidad de dominio es una
 * clase pura sin decoradores, mientras que la ORM usa decoradores
 * de TypeORM. Esta separación es clave en Arquitectura Hexagonal.
 *
 * Capa: Infraestructura (auth/persistence)
 * Dependencias:
 *   - TypeORM Repository<UserOrmEntity>
 *   - UserRepositoryPort (puerto que implementa)
 *   - User (entidad de dominio)
 *   - UserOrmEntity (entidad ORM)
 *
 * @module UserRepositoryImpl
 * @see UserRepositoryPort
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryPort } from '../../domain/interfaces/repositories/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../orm/user.orm-entity';

@Injectable()
export class UserRepositoryImpl implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const ormUser = this.toOrm(user);
    const savedOrmUser = await this.userRepository.save(ormUser);
    return this.toDomain(savedOrmUser);
  }

  async findById(id: string): Promise<User | null> {
    const ormUser = await this.userRepository.findOne({ where: { id } });
    return ormUser ? this.toDomain(ormUser) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const ormUser = await this.userRepository.findOne({ where: { phone } });
    return ormUser ? this.toDomain(ormUser) : null;
  }

  private toOrm(user: User): UserOrmEntity {
    const ormUser = new UserOrmEntity();
    ormUser.id = user.id;
    ormUser.phone = user.phone;
    ormUser.email = user.email;
    ormUser.passwordHash = user.passwordHash;
    ormUser.fullName = user.fullName;
    ormUser.cedula = user.cedula;
    ormUser.role = user.role;
    ormUser.jwtKey = user.jwtKey;
    ormUser.qrCode = user.qrCode;
    ormUser.qrKey = user.qrKey;
    ormUser.qrVersion = user.qrVersion;
    ormUser.category = user.category;
    ormUser.studentDocApproved = user.studentDocApproved;
    ormUser.isActive = user.isActive;
    ormUser.deletedAt = user.deletedAt;
    ormUser.lastLoginAt = user.lastLoginAt;
    return ormUser;
  }

  private toDomain(ormUser: UserOrmEntity): User {
    return new User(
      ormUser.id,
      ormUser.phone,
      ormUser.email,
      ormUser.passwordHash,
      ormUser.fullName,
      ormUser.cedula,
      ormUser.role,
      ormUser.jwtKey,
      ormUser.qrCode,
      ormUser.qrKey,
      ormUser.qrVersion,
      ormUser.category,
      ormUser.studentDocApproved,
      ormUser.isActive,
      ormUser.deletedAt,
      ormUser.lastLoginAt,
      ormUser.createdAt,
      ormUser.updatedAt,
    );
  }
}
