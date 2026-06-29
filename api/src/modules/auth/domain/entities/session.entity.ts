// auth/domain/entities/session.entity.ts
export type UserType = 'admin' | 'passenger';
export type ClientType = 'phone' | 'web' | 'tablet';

export class Session {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly userType: UserType,
    public readonly clientType: ClientType,
    public readonly jwtKey: string,
    public readonly expiresAt: Date,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    userId: string;
    userType: UserType;
    clientType: ClientType;
    jwtKey: string;
    expiresInHours?: number;
  }): Session {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (data.expiresInHours ?? 24));
    return new Session(
      crypto.randomUUID(),
      data.userId,
      data.userType,
      data.clientType,
      data.jwtKey,
      expiresAt,
      true,
      new Date(),
      new Date(),
    );
  }
}
