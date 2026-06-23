// src/modules/auth/infrastructure/orm/driver-request.orm-entity.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * DriverRequestOrmEntity — Entidad TypeORM para auth.driver_requests
 * ═══════════════════════════════════════════════════════════════
 *
 * Mapeo ORM de la tabla `auth.driver_requests`. Almacena las
 * solicitudes de afiliación de conductores a cooperativas.
 *
 * La columna documents_urls es JSONB para almacenar URLs de
 * documentos de forma flexible (cédula, licencia, certificados).
 *
 * Esquema: auth
 * Tabla: driver_requests
 *
 * Capa: Infraestructura (auth/orm)
 *
 * @see DriverRequest
 * @see DriverRequestRepositoryImpl
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type DriverRequestStatus = 'pending' | 'approved' | 'rejected';

@Entity({ name: 'driver_requests', schema: 'auth' })
export class DriverRequestOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'driver_id' })
  driverId: string;

  @Column({ type: 'uuid', name: 'association_id' })
  associationId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: DriverRequestStatus;

  @Column({ type: 'jsonb', name: 'documents_urls', nullable: true })
  documentsUrls: Record<string, any> | null;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string | null;

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
