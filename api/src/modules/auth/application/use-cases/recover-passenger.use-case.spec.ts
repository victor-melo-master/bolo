// src/modules/auth/application/use-cases/recover-passenger.use-case.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { RecoverPassengerUseCase } from './recover-passenger.use-case';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import { NOTIFICATION_SERVICE_PORT } from '../../domain/interfaces/services/notification.service.port';
import { SESSION_REPOSITORY_PORT } from '../../domain/interfaces';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { randomInt, randomUUID } from 'crypto';
import { Session } from '../../domain/entities/session.entity';

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  randomInt: jest.fn(),
  randomUUID: jest.fn(),
}));

describe('RecoverPassengerUseCase', () => {
  let useCase: RecoverPassengerUseCase;
  let passengerRepo: any;
  let notificationService: any;
  let sessionRepo: any;
  let cryptoService: any;
  let jwtService: any;

  beforeEach(async () => {
    passengerRepo = {
      findByPhoneIncludeDeleted: jest.fn(),
      findByEmailIncludeDeleted: jest.fn(),
      findByRecoveryCode: jest.fn(),
      save: jest.fn(),
    };

    notificationService = {
      sendRecoveryCode: jest.fn(),
    };

    sessionRepo = {
      deactivateAllForUser: jest.fn(),
      save: jest.fn(),
    };

    cryptoService = {
      hash: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecoverPassengerUseCase,
        { provide: PASSENGER_REPOSITORY_PORT, useValue: passengerRepo },
        { provide: NOTIFICATION_SERVICE_PORT, useValue: notificationService },
        { provide: SESSION_REPOSITORY_PORT, useValue: sessionRepo },
        { provide: CryptoService, useValue: cryptoService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    useCase = module.get<RecoverPassengerUseCase>(RecoverPassengerUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('request', () => {
    beforeEach(() => {
      (randomInt as jest.Mock).mockReturnValue(123456); // código fijo
    });

    it('no debe hacer nada si el pasajero no existe', async () => {
      passengerRepo.findByEmailIncludeDeleted.mockResolvedValue(null);

      await useCase.request({ email: 'noexiste@example.com' });

      expect(passengerRepo.save).not.toHaveBeenCalled();
      expect(notificationService.sendRecoveryCode).not.toHaveBeenCalled();
    });

    it('debe generar código, guardarlo y notificar si el pasajero existe (incluso activo)', async () => {
      const passenger = {
        id: '123',
        email: 'activa@example.com',
        deletedAt: null,
        recoveryCode: null,
        recoveryCodeExpiresAt: null,
      };
      passengerRepo.findByEmailIncludeDeleted.mockResolvedValue(passenger);

      await useCase.request({ email: 'activa@example.com' });

      // Verificar que se asignó el código directamente a las propiedades
      expect(passenger.recoveryCode).toBe('123456');
      expect(passenger.recoveryCodeExpiresAt).toEqual(expect.any(Date));
      expect(passengerRepo.save).toHaveBeenCalledWith(passenger);
      expect(notificationService.sendRecoveryCode).toHaveBeenCalledWith(
        'activa@example.com',
        '123456',
      );
    });

    it('debe funcionar con teléfono', async () => {
      const passenger = {
        id: '456',
        email: 'telefono@example.com',
        deletedAt: new Date(),
        recoveryCode: null,
        recoveryCodeExpiresAt: null,
      };
      passengerRepo.findByPhoneIncludeDeleted.mockResolvedValue(passenger);

      await useCase.request({ phone: '04121234567' });

      expect(passenger.recoveryCode).toBe('123456');
      expect(passengerRepo.save).toHaveBeenCalledWith(passenger);
      expect(notificationService.sendRecoveryCode).toHaveBeenCalledWith(
        'telefono@example.com',
        '123456',
      );
    });

    it('no debe hacer nada si no se proporciona email ni teléfono', async () => {
      await useCase.request({});

      expect(passengerRepo.findByEmailIncludeDeleted).not.toHaveBeenCalled();
      expect(passengerRepo.findByPhoneIncludeDeleted).not.toHaveBeenCalled();
      expect(passengerRepo.save).not.toHaveBeenCalled();
      expect(notificationService.sendRecoveryCode).not.toHaveBeenCalled();
    });
  });

  describe('confirm', () => {
    const validDto = {
      token: '123456',
      newPassword: 'NewPass1',
      newPasswordConfirmation: 'NewPass1',
    };

    const passengerMock = {
      id: '123',
      phone: '+584121234567',
      fullName: 'Pasajero Prueba',
      role: 'passenger',
      recoveryCode: '123456',
      recoveryCodeExpiresAt: new Date(Date.now() + 10000),
      deletedAt: null,
      isActive: false,
      email: 'test@example.com',
      passwordHash: 'oldhash',
    };

    beforeEach(() => {
      (randomUUID as jest.Mock).mockReturnValue('session-uuid');
      cryptoService.hash.mockResolvedValue('hashed-password');
      jwtService.sign.mockReturnValue('access-token-123');
      passengerRepo.findByRecoveryCode.mockResolvedValue(passengerMock);
    });

    it('debe reactivar, cambiar contraseña, invalidar sesiones, crear sesión y retornar token + usuario', async () => {
      const result = await useCase.confirm(validDto);

      // Verificar que se buscó por código
      expect(passengerRepo.findByRecoveryCode).toHaveBeenCalledWith('123456');
      // Verificar hash
      expect(cryptoService.hash).toHaveBeenCalledWith('NewPass1');
      // Verificar que se guardó el pasajero con los campos actualizados
      expect(passengerRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '123',
          passwordHash: 'hashed-password',
          deletedAt: null,
          isActive: true,
          recoveryCode: null,
          recoveryCodeExpiresAt: null,
        }),
      );
      // Invalidar sesiones anteriores
      expect(sessionRepo.deactivateAllForUser).toHaveBeenCalledWith(
        '123',
        'passenger',
      );
      // Crear nueva sesión
      expect(sessionRepo.save).toHaveBeenCalledWith(expect.any(Session));
      // Firmar token
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: '123',
          sessionId: expect.any(String),
          role: 'passenger',
        }),
        { secret: expect.any(String), expiresIn: '24h' },
      );
      // Retorno esperado
      expect(result).toEqual({
        accessToken: 'access-token-123',
        user: {
          id: '123',
          phone: '+584121234567',
          fullName: 'Pasajero Prueba',
          role: 'passenger',
        },
      });
    });

    it('debe lanzar UnauthorizedException si el código no existe', async () => {
      passengerRepo.findByRecoveryCode.mockResolvedValue(null);
      await expect(useCase.confirm(validDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar UnauthorizedException si el código expiró', async () => {
      passengerRepo.findByRecoveryCode.mockResolvedValue({
        ...passengerMock,
        recoveryCodeExpiresAt: new Date(Date.now() - 10000),
      });
      await expect(useCase.confirm(validDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('debe lanzar BadRequestException si las contraseñas no coinciden', async () => {
      const badDto = { ...validDto, newPasswordConfirmation: 'Diferente' };
      await expect(useCase.confirm(badDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
