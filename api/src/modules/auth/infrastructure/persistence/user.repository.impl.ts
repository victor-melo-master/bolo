// src/modules/auth/infrastructure/persistence/user.repository.impl.ts — Ruta relativa desde src/
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

// Injectable: registra la clase en el contenedor DI de NestJS para que
// pueda ser inyectada donde se use el token USER_REPOSITORY_PORT
@Injectable()
export class UserRepositoryImpl implements UserRepositoryPort {
  constructor(
    // @InjectRepository inyecta el repositorio TypeORM específico para
    // UserOrmEntity, generado automáticamente por TypeOrmModule.forFeature
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  // save: recibe una entidad de dominio User, la convierte a ORM, la
  // persiste con TypeORM, y retorna la entidad de dominio resultante
  // (con los campos generados por BD como createdAt actualizado).
  // El patrón toDomain/toOrm aísla al dominio de TypeORM: si se migra
  // a otro ORM, solo cambian estos mappers y los decoradores de las
  // ORM entities; el dominio y los casos de uso no se modifican.
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

  // Mapeo dominio → ORM (toOrm): copia cada campo de la entidad de
  // dominio (User) a la entidad ORM (UserOrmEntity). Se hace propiedad
  // por propiedad porque son clases distintas sin herencia compartida.
  // Esto es intencional: la entidad de dominio y la ORM evolucionan
  // independientemente, y el mapper las mantiene sincronizadas.
  private toOrm(user: User): UserOrmEntity {
    const ormUser = new UserOrmEntity();
    ormUser.id = user.id;
    ormUser.phone = user.phone;
    ormUser.email = user.email;
    ormUser.passwordHash = user.passwordHash;
    ormUser.fullName = user.fullName;
    ormUser.cedula = user.cedula;
    ormUser.role = user.role;
    ormUser.associationId = user.associationId ?? null;
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

  // Mapeo ORM → dominio (toDomain): construye una nueva entidad de
  // dominio User a partir de la ORM entity. El constructor de User
  // recibe todos los campos posicionalmente, lo que fuerza a mapear
  // explícitamente cada propiedad y evita errores por cambios no
  // sincronizados entre las dos representaciones.
  private toDomain(ormUser: UserOrmEntity): User {
    return new User(
      ormUser.id,
      ormUser.phone,
      ormUser.email,
      ormUser.passwordHash,
      ormUser.fullName,
      ormUser.cedula,
      ormUser.role,
      ormUser.associationId,
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

  // updateJwtKey: actualiza solo la columna jwt_key del usuario sin
  // cargar la entidad completa. Se usa Repository.update() de TypeORM
  // en lugar de save() porque:
  // 1. Es más eficiente: genera un UPDATE directo en SQL sin SELECT previo.
  // 2. Evita condiciones de carrera al no requerir carga de la entidad.
  // 3. Solo modifica el campo jwtKey sin riesgo de sobrescribir otros
  //    campos con valores desactualizados en memoria.
  // Se usa en LoginUseCase para regenerar la clave JWT en cada login.
  async updateJwtKey(userId: string, jwtKey: string): Promise<void> {
    await this.userRepository.update(userId, { jwtKey });
  }
}
