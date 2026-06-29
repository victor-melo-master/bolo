// auth/domain/entities/passenger.entity.ts
export type PassengerCategory = 'normal' | 'student' | 'elderly';

export class Passenger {
  constructor(
    public readonly id: string,
    public readonly phone: string,
    public readonly email: string | null,
    public readonly passwordHash: string,
    public readonly fullName: string,
    public readonly cedula: string | null,
    public readonly jwtKey: string | null, // ← añadido
    public readonly category: PassengerCategory,
    public readonly studentDocApproved: boolean,
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
    category?: PassengerCategory;
  }): Passenger {
    return new Passenger(
      crypto.randomUUID(),
      data.phone,
      data.email ?? null,
      data.passwordHash,
      data.fullName,
      data.cedula ?? null,
      null, // jwtKey – se asigna en el primer login
      data.category ?? 'normal',
      false, // studentDocApproved
      true, // isActive
      null, // deletedAt
      null, // lastLoginAt
      new Date(),
      new Date(),
    );
  }
}
