import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminRepositoryPort } from '../../domain/interfaces/repositories/admin.repository.port';
import { Admin } from '../../domain/entities/admin.entity';
import { AdminOrmEntity } from '../orm/admin.orm-entity';

@Injectable()
export class AdminRepositoryImpl implements AdminRepositoryPort {
  constructor(
    @InjectRepository(AdminOrmEntity)
    private readonly ormRepo: Repository<AdminOrmEntity>,
  ) {}

  async findByPhone(phone: string): Promise<Admin | null> {
    const orm = await this.ormRepo.findOne({ where: { phone } });
    return orm ? this.toDomain(orm) : null;
  }

  async findById(id: string): Promise<Admin | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async save(admin: Admin): Promise<Admin> {
    const orm = this.toOrm(admin);
    const saved = await this.ormRepo.save(orm);
    return this.toDomain(saved);
  }

  async updateAssociationId(
    adminId: string,
    associationId: string,
  ): Promise<void> {
    await this.ormRepo.update(adminId, { associationId });
  }

  private toDomain(orm: AdminOrmEntity): Admin {
    return new Admin(
      orm.id,
      orm.phone,
      orm.email,
      orm.passwordHash,
      orm.fullName,
      orm.cedula,
      orm.role,
      orm.qrCode,
      orm.qrKey,
      orm.qrVersion,
      orm.associationId,
      orm.isActive,
      orm.deletedAt,
      orm.lastLoginAt,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(admin: Admin): AdminOrmEntity {
    const orm = new AdminOrmEntity();
    orm.id = admin.id;
    orm.phone = admin.phone;
    orm.email = admin.email;
    orm.passwordHash = admin.passwordHash;
    orm.fullName = admin.fullName;
    orm.cedula = admin.cedula;
    orm.role = admin.role;
    orm.qrCode = admin.qrCode;
    orm.qrKey = admin.qrKey;
    orm.qrVersion = admin.qrVersion;
    orm.associationId = admin.associationId;
    orm.isActive = admin.isActive;
    orm.deletedAt = admin.deletedAt;
    orm.lastLoginAt = admin.lastLoginAt;
    orm.createdAt = admin.createdAt;
    orm.updatedAt = admin.updatedAt;
    return orm;
  }

  async softDelete(passengerId: string): Promise<void> {
    await this.ormRepo.update(passengerId, {
      isActive: false,
      deletedAt: new Date(),
    });
  }
}
