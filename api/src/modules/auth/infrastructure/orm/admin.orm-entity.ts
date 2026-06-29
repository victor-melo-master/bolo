// auth/infrastructure/orm/admin.orm-entity.ts
/**
 * Mapeo ORM de la tabla `auth.admins`.
 * Contraparte de infraestructura de la entidad de dominio Admin.
 *
 * Campos adicionales respecto a passengers: role, qr_code, qr_key,
 * qr_version, association_id.
 *
 * Esquema: auth
 * Tabla: admins
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type AdminRole = 'driver' | 'association_admin' | 'super_admin';

@Entity({ name: 'admins', schema: 'auth' })
export class AdminOrmEntity {
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
    enum: ['driver', 'association_admin', 'super_admin'],
  })
  role: AdminRole;

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

  @Column({ type: 'uuid', name: 'association_id', nullable: true })
  associationId: string | null;

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
