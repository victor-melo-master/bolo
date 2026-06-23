// projectBolo/api/src/modules/auth/infrastructure/orm/driver-request.orm-entity.ts
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
