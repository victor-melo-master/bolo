// src/modules/auth/infrastructure/orm/driver-request.orm-entity.ts — Ruta relativa desde src/
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

// @Entity asigna la tabla 'driver_requests' en el esquema 'auth'.
// Contraparte ORM de la entidad de dominio DriverRequest, mapeada
// por DriverRequestRepositoryImpl mediante toDomain/toOrm.
@Entity({ name: 'driver_requests', schema: 'auth' })
export class DriverRequestOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ID del conductor que solicita afiliación (FK a auth.users).
  // Se almacena como UUID simple, sin relación TypeORM, para mantener
  // el desacoplamiento entre capas.
  @Column({ type: 'uuid', name: 'driver_id' })
  driverId: string;

  // ID de la asociación/cooperativa a la que se solicita afiliación
  @Column({ type: 'uuid', name: 'association_id' })
  associationId: string;

  // Estado de la solicitud: pendiente, aprobada o rechazada
  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: DriverRequestStatus;

  // documents_urls: columna JSONB para almacenar URLs de documentos
  // de forma flexible. Se usa Record<string, any> porque los documentos
  // pueden variar según el tipo de solicitud (cédula, licencia, etc.).
  @Column({ type: 'jsonb', name: 'documents_urls', nullable: true })
  documentsUrls: Record<string, any> | null;

  // Motivo del rechazo, solo aplica cuando status = 'rejected'
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
