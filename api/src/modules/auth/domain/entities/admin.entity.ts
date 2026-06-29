// auth/domain/entities/admin.entity.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * Admin — Entidad de Dominio de Administrador
 * ═══════════════════════════════════════════════════════════════
 *
 * Representa un administrador del sistema (conductor, admin de asociación
 * o super admin). Entidad pura sin decoradores de ORM.
 *
 * Capa: Dominio (auth)
 * Dependencias:
 *   - (ninguna para entidades puras)
 *
 * @module Admin
 */
export type AdminRole = 'driver' | 'association_admin' | 'super_admin';

export class Admin {
  constructor(
    public readonly id: string,
    public readonly phone: string,
    public readonly email: string | null,
    public readonly passwordHash: string,
    public readonly fullName: string,
    public readonly cedula: string | null,
    public readonly role: AdminRole,
    // ── Los JWT keys se gestionan en la tabla auth.sessions ──
    public readonly qrCode: string | null,
    public readonly qrKey: string | null,
    public readonly qrVersion: number,
    public readonly associationId: string | null,
    public readonly isActive: boolean,
    public readonly deletedAt: Date | null,
    public readonly lastLoginAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    phone: string;
    email?: string;
    passwordHash: string;
    fullName: string;
    cedula?: string;
    role: AdminRole;
    associationId?: string;
  }): Admin {
    return new Admin(
      crypto.randomUUID(),
      data.phone,
      data.email ?? null,
      data.passwordHash,
      data.fullName,
      data.cedula ?? null,
      data.role,
      null, // qrCode
      null, // qrKey
      1, // qrVersion
      data.associationId ?? null,
      true, // isActive
      null, // deletedAt
      null, // lastLoginAt
      new Date(),
      new Date(),
    );
  }
}
