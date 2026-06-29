// auth/infrastructure/orm/passenger.orm-entity.ts
/**
 * Mapeo ORM de la tabla `auth.passengers`.
 * Contraparte de infraestructura de la entidad de dominio Passenger.
 *
 * Campos principales: phone, email, password_hash, full_name, cedula,
 * jwt_key, category, student_doc_approved.
 *
 * Esquema: auth
 * Tabla: passengers
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type PassengerCategory = 'normal' | 'student' | 'elderly';

@Entity({ name: 'passengers', schema: 'auth' })
export class PassengerOrmEntity {
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

  @Column({ type: 'text', name: 'jwt_key', nullable: true })
  jwtKey: string | null;

  @Column({
    type: 'enum',
    enum: ['normal', 'student', 'elderly'],
    default: 'normal',
  })
  category: PassengerCategory;

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
