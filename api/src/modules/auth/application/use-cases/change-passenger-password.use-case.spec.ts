// auth/application/use-cases/change-passenger-password.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * ChangePassengerPasswordUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso cambie la contraseña de un
 * pasajero validando la contraseña actual y manejando errores.
 *
 * @module test/change-passenger-password.use-case.spec
 */
// auth/application/use-cases/change-passenger-password.use-case.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ChangePassengerPasswordUseCase } from './change-passenger-password.use-case';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import { SESSION_REPOSITORY_PORT } from '../../domain/interfaces';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { Passenger } from '../../domain/entities/passenger.entity';
import { ChangePasswordDto } from '../dto/change-password.dto';

describe('ChangePassengerPasswordUseCase', () => {
  let useCase: ChangePassengerPasswordUseCase;
  let passengerRepo: any;
  let cryptoService: any;
  let sessionRepo: any;

  const mockPassenger = new Passenger(
    'passenger-id',
    '04141234500',
    null,
    'hashed_old_pass',
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
      findById: jest.fn(),
      save: jest.fn(),
    };
    cryptoService = {
      compare: jest.fn(),
      hash: jest.fn(),
    };
    sessionRepo = {
      deactivateAllForUser: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePassengerPasswordUseCase,
        { provide: PASSENGER_REPOSITORY_PORT, useValue: passengerRepo },
        { provide: CryptoService, useValue: cryptoService },
        { provide: SESSION_REPOSITORY_PORT, useValue: sessionRepo }, // <-- añadido
      ],
    }).compile();

    useCase = module.get<ChangePassengerPasswordUseCase>(
      ChangePassengerPasswordUseCase,
    );
  });

  const dto: ChangePasswordDto = {
    currentPassword: 'OldPass1',
    newPassword: 'NewPass2',
    newPasswordConfirmation: 'NewPass2',
  };

  it('should change password when current password is correct', async () => {
    passengerRepo.findById.mockResolvedValue(mockPassenger);
    cryptoService.compare.mockResolvedValue(true); // contraseña actual válida
    cryptoService.hash.mockResolvedValue('hashed_new_pass');
    passengerRepo.save.mockResolvedValue({
      ...mockPassenger,
      passwordHash: 'hashed_new_pass',
    });

    await useCase.execute('passenger-id', dto);

    expect(passengerRepo.findById).toHaveBeenCalledWith('passenger-id');
    expect(cryptoService.compare).toHaveBeenCalledWith(
      'OldPass1',
      'hashed_old_pass',
    );
    expect(cryptoService.hash).toHaveBeenCalledWith('NewPass2');
    expect(passengerRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'hashed_new_pass' }),
    );
    // Verifica que se invalidaron sesiones activas
    expect(sessionRepo.deactivateAllForUser).toHaveBeenCalledWith(
      'passenger-id',
      'passenger',
    );
  });

  it('should throw UnauthorizedException if current password is wrong', async () => {
    passengerRepo.findById.mockResolvedValue(mockPassenger);
    cryptoService.compare.mockResolvedValue(false); // contraseña incorrecta

    await expect(useCase.execute('passenger-id', dto)).rejects.toThrow(
      UnauthorizedException,
    );
    expect(cryptoService.hash).not.toHaveBeenCalled();
    expect(passengerRepo.save).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if passenger not found', async () => {
    passengerRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown-id', dto)).rejects.toThrow(
      NotFoundException,
    );
  });
});
