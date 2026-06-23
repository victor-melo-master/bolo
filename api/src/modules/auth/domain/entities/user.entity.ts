// auth/domain/entities/user.entity.ts

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

  // Método de fábrica para crear un nuevo usuario (puede incluir validaciones)
  static create(
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): User {
    return new User(
      data.id ?? crypto.randomUUID(), // placeholder; luego se usará uuidv7()
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
