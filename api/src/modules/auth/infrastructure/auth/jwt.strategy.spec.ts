// src/modules/auth/infrastructure/auth/jwt.strategy.spec.ts — Ruta relativa desde src/
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

  // Helper que genera un token JWT sintético con formato header.payload.signature
  // usando base64url. La firma es falsa ('fake-signature') porque resolveSecretKey
  // solo decodifica el payload sin verificar la firma; la verificación real se
  // prueba en tests de integración/e2e donde se firma con una clave real.
  const createFakeToken = (payload: any) => {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
    ).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = 'fake-signature';
    return `${header}.${body}.${signature}`;
  };

  // Usuario mock con todos los campos necesarios, incluyendo jwtKey
  // para probar resolveSecretKey
  const mockUser = new User(
    'user-id',
    '+584141234567',
    null,
    'hashed_pass',
    'Test User',
    null,
    'passenger',
    'current-jwt-key', // jwtKey: clave actual del usuario
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
    // Crea un módulo de prueba NestJS con JwtStrategy y un mock del
    // repositorio de usuarios (USER_REPOSITORY_PORT) cuyos métodos
    // son funciones jest.fn() para poder simular comportamientos
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
      // Verifica que validate() transforma correctamente el payload JWT
      // decodificado en el objeto que se asigna a req.user
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
      // Escenario feliz: usuario existe y tiene jwtKey asignada
      const token = createFakeToken({ sub: 'user-id' });
      userRepo.findById.mockResolvedValue(mockUser);

      const key = await (strategy as any).resolveSecretKey(token);
      expect(userRepo.findById).toHaveBeenCalledWith('user-id');
      expect(key).toBe('current-jwt-key');
    });

    it('should throw error if token has no sub', async () => {
      // Token malformado sin campo 'sub': debe lanzar 'Token sin sub'
      const token = createFakeToken({ other: 'value' });

      await expect((strategy as any).resolveSecretKey(token)).rejects.toThrow(
        'Token sin sub',
      );
    });

    it('should throw error if user not found', async () => {
      // Usuario inexistente en BD: findById retorna null
      const token = createFakeToken({ sub: 'nonexistent' });
      userRepo.findById.mockResolvedValue(null);

      await expect((strategy as any).resolveSecretKey(token)).rejects.toThrow(
        'Usuario no encontrado o sin llave',
      );
    });

    it('should throw error if user has no jwtKey', async () => {
      // Usuario existe pero sin jwtKey (nunca ha iniciado sesión
      // o se le revocaron todas las sesiones activas)
      const token = createFakeToken({ sub: 'user-id' });
      const userWithoutKey = { ...mockUser, jwtKey: null };
      userRepo.findById.mockResolvedValue(userWithoutKey as any);

      await expect((strategy as any).resolveSecretKey(token)).rejects.toThrow(
        'Usuario no encontrado o sin llave',
      );
    });
  });
});
