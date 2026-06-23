// src/modules/auth/infrastructure/orm/user.orm-entity.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * UserOrmEntity — Entidad TypeORM para la tabla auth.users
 * ═══════════════════════════════════════════════════════════════
 *
 * Mapeo objeto-relacional de la tabla `auth.users` en PostgreSQL.
 * Es la contraparte de infraestructura de la entidad de dominio User.
 *
 * La separación entre User (dominio) y UserOrmEntity (ORM) permite:
 *   - Mantener el dominio puro, sin decoradores ni dependencias
 *   - Cambiar de ORM sin afectar la lógica de negocio
 *   - Tener distintos mapeos para distintas bases de datos
 *
 * Los mappers toDomain() / toOrm() en UserRepositoryImpl realizan
 * la conversión entre ambas representaciones.
 *
 * Esquema: auth
 * Tabla: users
 *
 * Capa: Infraestructura (auth/orm)
 * Dependencias:
 *   - TypeORM decorators (@Entity, @Column, etc.)
 *   - clock_timestamp() de PostgreSQL para createdAt/updatedAt
 *
 * @see User
 * @see UserRepositoryImpl
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole =
  | 'passenger'
  | 'driver'
  | 'association_admin'
  | 'super_admin';
export type UserCategory = 'normal' | 'student' | 'elderly';

@Entity({ name: 'users', schema: 'auth' })
export class UserOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email: string | null;

  @Column({ type: 'text', name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  cedula: string | null;

  @Column({
    type: 'enum',
    enum: ['passenger', 'driver', 'association_admin', 'super_admin'],
    default: 'passenger',
  })
  role: UserRole;

  @Column({ type: 'text', name: 'jwt_key', nullable: true })
  jwtKey: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    name: 'qr_code',
    nullable: true,
  })
  qrCode: string | null;

  @Column({ type: 'text', name: 'qr_key', nullable: true })
  qrKey: string | null;

  @Column({ type: 'int', name: 'qr_version', default: 1 })
  qrVersion: number;

  @Column({
    type: 'enum',
    enum: ['normal', 'student', 'elderly'],
    default: 'normal',
  })
  category: UserCategory;

  @Column({ type: 'boolean', name: 'student_doc_approved', default: false })
  studentDocApproved: boolean;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'clock_timestamp()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    default: () => 'clock_timestamp()',
  })
  updatedAt: Date;
}
