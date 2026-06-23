// src/modules/auth/domain/entities/user.entity.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * User — Entidad de Dominio de Usuario
 * ═══════════════════════════════════════════════════════════════
 *
 * Representa un usuario del sistema BOLO. Puede ser pasajero,
 * conductor, administrador de cooperativa o superadministrador.
 *
 * Roles (UserRole):
 *   - passenger:         usuario que solicita viajes
 *   - driver:            conductor que presta el servicio
 *   - association_admin: administrador de una cooperativa
 *   - super_admin:       administrador global del sistema
 *
 * Categorías tarifarias (UserCategory):
 *   - normal:  tarifa estándar
 *   - student: tarifa estudiantil (requiere documento aprobado)
 *   - elderly: tarifa de adulto mayor
 *
 * Soporta soft-delete (deletedAt) y tracking de último login.
 * Los QR codes (qrCode, qrKey, qrVersion) se usan para emisión
 * de tickets digitales o identificación rápida del conductor.
 *
 * Capa: Dominio (auth)
 * Método de fábrica:
 *   User.create(data) — construye un nuevo usuario con defaults
 *     sensatos (isActive: true, qrVersion: 1, etc.)
 *
 * @module User
 * @see UserRole
 * @see UserCategory
 */

export type UserRole =
  | 'passenger'
  | 'driver'
  | 'association_admin'
  | 'super_admin';
export type UserCategory = 'normal' | 'student' | 'elderly';

export class User {
  constructor(
    public readonly id: string,
    public readonly phone: string,
    public readonly email: string | null,
    public readonly passwordHash: string,
    public readonly fullName: string,
    public readonly cedula: string | null,
    public readonly role: UserRole,
    public readonly jwtKey: string | null,
    public readonly qrCode: string | null,
    public readonly qrKey: string | null,
    public readonly qrVersion: number,
    public readonly category: UserCategory,
    public readonly studentDocApproved: boolean,
    public readonly isActive: boolean,
    public readonly deletedAt: Date | null,
    public readonly lastLoginAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): User {
    return new User(
      data.id ?? crypto.randomUUID(), // TODO: migrar a uuidv7() nativo de PG 18
      data.phone,
      data.email ?? null,
      data.passwordHash,
      data.fullName,
      data.cedula ?? null,
      data.role,
      data.jwtKey ?? null,
      data.qrCode ?? null,
      data.qrKey ?? null,
      data.qrVersion ?? 1,
      data.category,
      data.studentDocApproved ?? false,
      data.isActive ?? true,
      data.deletedAt ?? null,
      data.lastLoginAt ?? null,
      new Date(),
      new Date(),
    );
  }
}
