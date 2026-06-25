// src/modules/auth/infrastructure/orm/user.orm-entity.ts — Ruta relativa desde src/
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

// @Entity configura el nombre de la tabla ('users') y el esquema ('auth')
// en PostgreSQL. La separación entre esta entidad ORM (con decoradores) y
// la entidad de dominio User (clase plana sin decoradores) es intencional:
// el dominio no debe depender de TypeORM ni de ningún framework de persistencia.
// Los repositorios (UserRepositoryImpl) mapean entre ambas con toDomain/toOrm.
@Entity({ name: 'users', schema: 'auth' })
export class UserOrmEntity {
  // PrimaryGeneratedColumn('uuid') genera automáticamente un UUID v4 como
  // clave primaria usando la función gen_random_uuid() de PostgreSQL
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // phone: VARCHAR(20) con UNIQUE, identificador principal del usuario
  // en el sistema (el registro es por número telefónico)
  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  // email: nullable porque el registro puede ser solo con teléfono.
  // Unique constraint para evitar duplicados cuando se proporciona
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  email: string | null;

  // name: 'password_hash' → se usa snake_case explícitamente porque la
  // propiedad en TypeScript es passwordHash (camelCase) pero en PostgreSQL
  // la convención es snake_case para nombres de columna. TypeORM por defecto
  // usaría camelCase, por eso se especifica name explícitamente.
  @Column({ type: 'text', name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'varchar', length: 255, name: 'full_name' })
  fullName: string;

  // Cédula de identidad venezolana: nullable porque no es obligatoria
  // al registrarse, pero se puede agregar después para verificación
  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  cedula: string | null;

  // Columna tipo ENUM de PostgreSQL con los roles del sistema.
  // Default 'passenger': todo usuario nuevo es pasajero hasta que
  // se afilie como driver o association_admin
  @Column({
    type: 'enum',
    enum: ['passenger', 'driver', 'association_admin', 'super_admin'],
    default: 'passenger',
  })
  role: UserRole;

  // Id de la asociacion a la que pertenece un usuario si es 'drive' o 'association_admin'
  @Column({ type: 'uuid', name: 'association_id', nullable: true })
  associationId: string | null;

  // jwt_key: clave secreta JWT específica del usuario, se genera en cada
  // inicio de sesión para invalidar sesiones anteriores. Si es null, el
  // usuario no puede autenticarse (todas las sesiones revocadas).
  @Column({ type: 'text', name: 'jwt_key', nullable: true })
  jwtKey: string | null;

  // Código QR único para identificación del usuario en viajes
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
    name: 'qr_code',
    nullable: true,
  })
  qrCode: string | null;

  // Clave para encriptar/desencriptar datos del código QR
  @Column({ type: 'text', name: 'qr_key', nullable: true })
  qrKey: string | null;

  // Versión del formato QR para compatibilidad hacia atrás
  @Column({ type: 'int', name: 'qr_version', default: 1 })
  qrVersion: number;

  // Categoría para tarifas diferenciadas: estudiante, adulto mayor, normal
  @Column({
    type: 'enum',
    enum: ['normal', 'student', 'elderly'],
    default: 'normal',
  })
  category: UserCategory;

  // Indica si un estudiante fue verificado documentalmente para obtener
  // tarifa preferencial
  @Column({ type: 'boolean', name: 'student_doc_approved', default: false })
  studentDocApproved: boolean;

  // Soft delete: is_active=false desactiva la cuenta sin borrar datos
  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  // Timestamp del soft delete (borrado lógico), null mientras esté activo
  @Column({ type: 'timestamptz', name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  // Último inicio de sesión del usuario
  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  // CreateDateColumn: TypeORM asigna automáticamente la fecha de creación
  // del registro. Se usa clock_timestamp() de PostgreSQL en lugar de NOW()
  // porque clock_timestamp() devuelve la hora real del reloj en cada llamada,
  // mientras que NOW() es constante dentro de una misma transacción.
  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
    default: () => 'clock_timestamp()',
  })
  createdAt: Date;

  // UpdateDateColumn: TypeORM actualiza automáticamente este campo en cada
  // modificación del registro (UPDATE), también con clock_timestamp()
  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    default: () => 'clock_timestamp()',
  })
  updatedAt: Date;
}
