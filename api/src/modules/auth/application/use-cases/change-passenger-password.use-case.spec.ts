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
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ChangePassengerPasswordUseCase } from './change-passenger-password.use-case';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { Passenger } from '../../domain/entities/passenger.entity';

describe('ChangePassengerPasswordUseCase', () => {
  let useCase: ChangePassengerPasswordUseCase;
  let passengerRepo: any;
  let cryptoService: any;

  const mockPassenger = new Passenger(
    'passenger-id',
    '+584141234500',
    null,
    'hashed_current',
    'Test',
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
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangePassengerPasswordUseCase,
        { provide: PASSENGER_REPOSITORY_PORT, useValue: passengerRepo },
        { provide: CryptoService, useValue: cryptoService },
      ],
    }).compile();

    useCase = module.get<ChangePassengerPasswordUseCase>(
      ChangePassengerPasswordUseCase,
    );
  });

  it('should change password when current password is correct', async () => {
    passengerRepo.findById.mockResolvedValue(mockPassenger);
    cryptoService.compare.mockResolvedValue(true); // contraseña actual correcta
    cryptoService.hash.mockResolvedValue('new_hashed');

    await useCase.execute('passenger-id', {
      currentPassword: 'OldPass1',
      newPassword: 'NewPass2',
    });

    expect(passengerRepo.findById).toHaveBeenCalledWith('passenger-id');
    expect(cryptoService.compare).toHaveBeenCalledWith(
      'OldPass1',
      'hashed_current',
    );
    expect(cryptoService.hash).toHaveBeenCalledWith('NewPass2');
    expect(passengerRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'new_hashed' }),
    );
  });

  it('should throw UnauthorizedException if current password is wrong', async () => {
    passengerRepo.findById.mockResolvedValue(mockPassenger);
    cryptoService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute('passenger-id', {
        currentPassword: 'WrongPass',
        newPassword: 'NewPass2',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(passengerRepo.save).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if passenger not found', async () => {
    passengerRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('unknown-id', {
        currentPassword: 'OldPass1',
        newPassword: 'NewPass2',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(passengerRepo.save).not.toHaveBeenCalled();
  });
});
