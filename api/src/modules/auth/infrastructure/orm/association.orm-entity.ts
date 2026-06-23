// src/modules/auth/infrastructure/orm/association.orm-entity.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * AssociationOrmEntity — Entidad TypeORM para tabla auth.associations
 * ═══════════════════════════════════════════════════════════════
 *
 * Mapeo ORM de la tabla `auth.associations`. Contraparte de
 * infraestructura de la entidad de dominio Association.
 *
 * Esquema: auth
 * Tabla: associations
 *
 * Capa: Infraestructura (auth/orm)
 *
 * @see Association
 * @see AssociationRepositoryImpl
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'associations', schema: 'auth' })
export class AssociationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  rif: string;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'uuid', name: 'admin_id', nullable: true })
  adminId: string | null;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

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
