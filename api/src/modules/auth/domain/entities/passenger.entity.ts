// src/modules/auth/domain/entities/passenger.entity.ts

export type PassengerCategory = 'normal' | 'student' | 'elderly';

export class Passenger {
  public readonly id: string;
  public readonly phone: string;
  public readonly email: string | null;
  public readonly passwordHash: string;
  public readonly fullName: string;
  public readonly cedula: string | null;
  public readonly jwtKey: string | null;
  public readonly category: PassengerCategory;
  public readonly studentDocApproved: boolean;
  public readonly isActive: boolean;
  public readonly deletedAt: Date | null;
  public readonly lastLoginAt: Date | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  // Campos de recuperación (públicos, no readonly, para facilitar mutación y spread)
  public recoveryCode: string | null = null;
  public recoveryCodeExpiresAt: Date | null = null;

  constructor(
    id: string,
    phone: string,
    email: string | null,
    passwordHash: string,
    fullName: string,
    cedula: string | null,
    jwtKey: string | null,
    category: PassengerCategory,
    studentDocApproved: boolean,
    isActive: boolean,
    deletedAt: Date | null,
    lastLoginAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    recoveryCode: string | null = null,
    recoveryCodeExpiresAt: Date | null = null,
  ) {
    this.id = id;
    this.phone = phone;
    this.email = email;
    this.passwordHash = passwordHash;
    this.fullName = fullName;
    this.cedula = cedula;
    this.jwtKey = jwtKey;
    this.category = category;
    this.studentDocApproved = studentDocApproved;
    this.isActive = isActive;
    this.deletedAt = deletedAt;
    this.lastLoginAt = lastLoginAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.recoveryCode = recoveryCode;
    this.recoveryCodeExpiresAt = recoveryCodeExpiresAt;
  }

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
      null, // jwtKey
      data.category ?? 'normal',
      false, // studentDocApproved
      true, // isActive
      null, // deletedAt
      null, // lastLoginAt
      new Date(),
      new Date(),
      null, // recoveryCode
      null, // recoveryCodeExpiresAt
    );
  }
}
