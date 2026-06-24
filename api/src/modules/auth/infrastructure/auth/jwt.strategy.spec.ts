// src/modules/auth/infrastructure/auth/jwt.strategy.spec.ts
/**
 *📌 Notas
 * Asumimos que resolveSecretKey es privado, pero para testearlo lo accedemos mediante (strategy as any). Si quieres evitar el as any, puedes cambiar el modificador de resolveSecretKey a public en la clase JwtStrategy.
 *
 * El helper createFakeToken genera un token con formato JWT válido para decodificar el payload sin verificar firma.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { USER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/user.repository.port';
import type { UserRepositoryPort } from '../../domain/interfaces/repositories/user.repository.port';
import { User } from '../../domain/entities/user.entity';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let userRepo: jest.Mocked<UserRepositoryPort>;

  // Helper para crear un token fake (header.payload.signature)
  const createFakeToken = (payload: any) => {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = 'fake-signature';
    return `${header}.${body}.${signature}`;
  };

  const mockUser = new User(
    'user-id',
    '+584141234567',
    null,
    'hashed_pass',
    'Test User',
    null,
    'passenger',
    'current-jwt-key', // jwtKey
    null,
    null,
    1,
    'normal',
    false,
    true,
    null,
    null,
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: USER_REPOSITORY_PORT,
          useValue: {
            findById: jest.fn(),
            findByPhone: jest.fn(),
            save: jest.fn(),
            updateJwtKey: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    userRepo = module.get(USER_REPOSITORY_PORT);
  });

  describe('validate', () => {
    it('should return user info from payload', () => {
      const payload = {
        sub: 'user-id',
        phone: '+584141234567',
        role: 'passenger',
      };

      const result = strategy.validate(payload);
      expect(result).toEqual({
        userId: 'user-id',
        phone: '+584141234567',
        role: 'passenger',
      });
    });
  });

  describe('resolveSecretKey', () => {
    it('should return jwtKey when user exists and has key', async () => {
      const token = createFakeToken({ sub: 'user-id' });
      userRepo.findById.mockResolvedValue(mockUser);

      const key = await (strategy as any).resolveSecretKey(token);
      expect(userRepo.findById).toHaveBeenCalledWith('user-id');
      expect(key).toBe('current-jwt-key');
    });

    it('should throw error if token has no sub', async () => {
      const token = createFakeToken({ other: 'value' });

      await expect((strategy as any).resolveSecretKey(token)).rejects.toThrow(
        'Token sin sub',
      );
    });

    it('should throw error if user not found', async () => {
      const token = createFakeToken({ sub: 'nonexistent' });
      userRepo.findById.mockResolvedValue(null);

      await expect((strategy as any).resolveSecretKey(token)).rejects.toThrow(
        'Usuario no encontrado o sin llave',
      );
    });

    it('should throw error if user has no jwtKey', async () => {
      const token = createFakeToken({ sub: 'user-id' });
      const userWithoutKey = { ...mockUser, jwtKey: null };
      userRepo.findById.mockResolvedValue(userWithoutKey as any);

      await expect((strategy as any).resolveSecretKey(token)).rejects.toThrow(
        'Usuario no encontrado o sin llave',
      );
    });
  });
});
