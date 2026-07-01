// src/modules/auth/infrastructure/orm/association.orm-entity.ts — Ruta relativa desde src/
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
 * @module AssociationOrmEntity
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// @Entity asigna la tabla 'associations' en el esquema 'auth'.
// Al igual que UserOrmEntity, está separada de la entidad de dominio
// Association para mantener el dominio libre de dependencias de ORM.
// AssociationRepositoryImpl se encarga del mapeo entre ambas.
@Entity({ name: 'associations', schema: 'auth' })
export class AssociationOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Nombre de la cooperativa/asociación, único
  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  // RIF (Registro de Información Fiscal) de la asociación, único en Venezuela
  @Column({ type: 'varchar', length: 20, unique: true })
  rif: string;

  // Dirección fiscal/física de la asociación
  @Column({ type: 'text', nullable: true })
  address: string | null;

  // Teléfono de contacto de la asociación
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  // ID del usuario administrador de la asociación (FK a auth.users).
  // No se define @ManyToOne aquí porque las relaciones se manejan a nivel
  // de dominio, no de ORM, para mantener el desacoplamiento.
  @Column({ type: 'uuid', name: 'admin_id', nullable: true })
  adminId: string | null;

  // Soft delete: false si la asociación fue desactivada
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
