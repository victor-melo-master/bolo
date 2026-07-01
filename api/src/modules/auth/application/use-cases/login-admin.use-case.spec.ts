// auth/application/use-cases/login-admin.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * LoginAdminUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso autentique a un administrador,
 * valide credenciales y genere un token JWT.
 *
 * @module test/login-admin.use-case.spec
 */
// auth/application/use-cases/login-admin.use-case.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginAdminUseCase } from './login-admin.use-case';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import { SESSION_REPOSITORY_PORT } from '../../domain/interfaces/repositories/session.repository.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { Admin } from '../../domain/entities/admin.entity';

describe('LoginAdminUseCase', () => {
  let useCase: LoginAdminUseCase;
  let adminRepo: any;
  let sessionRepo: any;
  let cryptoService: any;
  let jwtService: any;

  const mockAdmin = new Admin(
    'admin-id',
    '04141234567',
    null,
    'hashed_pass',
    'Admin Uno',
    null,
    'super_admin',
    null,
    null,
    1,
    null,
    true,
    null,
    null,
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    adminRepo = {
      findByPhone: jest.fn(),
      updateLastLogin: jest.fn(), // ← añadido aquí
    };
    sessionRepo = {
      save: jest.fn(),
      deactivateAllForUser: jest.fn(),
    };
    cryptoService = {
      compare: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginAdminUseCase,
        { provide: ADMIN_REPOSITORY_PORT, useValue: adminRepo },
        { provide: SESSION_REPOSITORY_PORT, useValue: sessionRepo },
        { provide: CryptoService, useValue: cryptoService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    useCase = module.get<LoginAdminUseCase>(LoginAdminUseCase);
  });

  it('should login successfully and return token', async () => {
    adminRepo.findByPhone.mockResolvedValue(mockAdmin);
    cryptoService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('mocked-token');

    const result = await useCase.execute('04141234567', 'Test1234');

    expect(adminRepo.findByPhone).toHaveBeenCalledWith('04141234567');
    expect(cryptoService.compare).toHaveBeenCalledWith(
      'Test1234',
      'hashed_pass',
    );
    expect(sessionRepo.save).toHaveBeenCalled();
    expect(jwtService.sign).toHaveBeenCalled();
    expect(result.accessToken).toBe('mocked-token');
    expect(result.user.id).toBe('admin-id');
  });

  it('should throw if admin not found', async () => {
    adminRepo.findByPhone.mockResolvedValue(null);
    await expect(useCase.execute('123', 'pass')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw if password is wrong', async () => {
    adminRepo.findByPhone.mockResolvedValue(mockAdmin);
    cryptoService.compare.mockResolvedValue(false);
    await expect(useCase.execute('04141234567', 'wrongpass')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw if admin is inactive', async () => {
    const inactiveAdmin = { ...mockAdmin, isActive: false };
    adminRepo.findByPhone.mockResolvedValue(inactiveAdmin);
    await expect(useCase.execute('04141234567', 'pass')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should create a session with default clientType "phone"', async () => {
    adminRepo.findByPhone.mockResolvedValue(mockAdmin);
    cryptoService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('token');

    await useCase.execute('04141234567', 'Test1234');

    const sessionArg = sessionRepo.save.mock.calls[0][0];
    expect(sessionArg.userId).toBe('admin-id');
    expect(sessionArg.userType).toBe('admin');
    expect(sessionArg.clientType).toBe('phone');
    expect(sessionArg.jwtKey).toBeDefined();
  });
});
