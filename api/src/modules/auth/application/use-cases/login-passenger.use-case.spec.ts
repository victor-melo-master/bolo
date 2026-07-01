// auth/application/use-cases/login-passenger.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * LoginPassengerUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso autentique a un pasajero,
 * valide credenciales y genere un token JWT.
 *
 * @module test/login-passenger.use-case.spec
 */
// auth/application/use-cases/login-passenger.use-case.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginPassengerUseCase } from './login-passenger.use-case';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import { SESSION_REPOSITORY_PORT } from '../../domain/interfaces/repositories/session.repository.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { Passenger } from '../../domain/entities/passenger.entity';

describe('LoginPassengerUseCase', () => {
  let useCase: LoginPassengerUseCase;
  let passengerRepo: any;
  let sessionRepo: any;
  let cryptoService: any;
  let jwtService: any;

  const mockPassenger = new Passenger(
    'passenger-id',
    '04141234500',
    null,
    'hashed_pass',
    'Pasajero Uno',
    null,
    null,
    'normal',
    false,
    true,
    null,
    null,
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    passengerRepo = {
      findByPhone: jest.fn(),
      updateLastLogin: jest.fn(), // ← añadido aquí
    };
    sessionRepo = {
      save: jest.fn(),
      deactivateAllForUser: jest.fn(),
      findActiveSessionsByUser: jest.fn().mockResolvedValue([]), // ← nuevo
      deactivateSessions: jest.fn().mockResolvedValue(undefined), //
    };
    cryptoService = {
      compare: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginPassengerUseCase,
        { provide: PASSENGER_REPOSITORY_PORT, useValue: passengerRepo },
        { provide: SESSION_REPOSITORY_PORT, useValue: sessionRepo },
        { provide: CryptoService, useValue: cryptoService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    useCase = module.get<LoginPassengerUseCase>(LoginPassengerUseCase);
  });

  it('should login successfully and return token', async () => {
    passengerRepo.findByPhone.mockResolvedValue(mockPassenger);
    cryptoService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('mocked-token');

    const result = await useCase.execute('04141234500', 'Test1234');

    expect(passengerRepo.findByPhone).toHaveBeenCalledWith('04141234500');
    expect(cryptoService.compare).toHaveBeenCalledWith(
      'Test1234',
      'hashed_pass',
    );
    expect(sessionRepo.save).toHaveBeenCalled();
    expect(jwtService.sign).toHaveBeenCalled();
    expect(result.accessToken).toBe('mocked-token');
    expect(result.user.id).toBe('passenger-id');
  });

  it('should throw if passenger not found', async () => {
    passengerRepo.findByPhone.mockResolvedValue(null);
    await expect(useCase.execute('123', 'pass')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw if password is wrong', async () => {
    passengerRepo.findByPhone.mockResolvedValue(mockPassenger);
    cryptoService.compare.mockResolvedValue(false);
    await expect(useCase.execute('04141234500', 'wrongpass')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw if passenger is inactive', async () => {
    const inactivePassenger = { ...mockPassenger, isActive: false };
    passengerRepo.findByPhone.mockResolvedValue(inactivePassenger);
    await expect(useCase.execute('04141234500', 'pass')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should create a session with default clientType "phone"', async () => {
    passengerRepo.findByPhone.mockResolvedValue(mockPassenger);
    cryptoService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('token');

    await useCase.execute('04141234500', 'Test1234');

    const sessionArg = sessionRepo.save.mock.calls[0][0];
    expect(sessionArg.userId).toBe('passenger-id');
    expect(sessionArg.userType).toBe('passenger');
    expect(sessionArg.clientType).toBe('phone');
    expect(sessionArg.jwtKey).toBeDefined();
  });
});
