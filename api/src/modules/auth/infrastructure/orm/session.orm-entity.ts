// src/modules/auth/infrastructure/orm/session.orm-entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * SessionOrmEntity — Entidad TypeORM para tabla auth.sessions
 * ═══════════════════════════════════════════════════════════════
 *
 * Mapeo ORM de la tabla `auth.sessions`. Contraparte de
 * infraestructura de la entidad de dominio Session.
 *
 * Almacena las sesiones JWT activas por usuario y tipo de cliente.
 *
 * Campos: user_id (polimórfico), user_type, client_type, jwt_key,
 * expires_at, is_active.
 *
 * Esquema: auth
 * Tabla: sessions
 *
 * Capa: Infraestructura (auth/orm)
 *
 * @see Session
 * @see SessionRepositoryImpl
 * @module SessionOrmEntity
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserType = 'admin' | 'passenger';
export type ClientType = 'phone' | 'web' | 'tablet';

@Entity({ name: 'sessions', schema: 'auth' })
export class SessionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 20, name: 'user_type' })
  userType: UserType;

  @Column({ type: 'varchar', length: 20, name: 'client_type' })
  clientType: ClientType;

  @Column({ type: 'text', name: 'jwt_key' })
  jwtKey: string;

  @Column({ type: 'timestamptz', name: 'expires_at' })
  expiresAt: Date;

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
