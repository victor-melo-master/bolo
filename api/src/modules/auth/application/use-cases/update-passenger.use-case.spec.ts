// auth/application/use-cases/update-passenger.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * UpdatePassengerUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso actualice los datos de un
 * pasajero y lance NotFoundException si no existe.
 *
 * @module test/update-passenger.use-case.spec
 */
// auth/application/use-cases/update-passenger.use-case.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdatePassengerUseCase } from './update-passenger.use-case';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import { Passenger } from '../../domain/entities/passenger.entity';

describe('UpdatePassengerUseCase', () => {
  let useCase: UpdatePassengerUseCase;
  let passengerRepo: any;

  const mockPassenger = new Passenger(
    'passenger-id',
    '+584141234500',
    'old@email.com',
    'hash',
    'Pasajero Viejo',
    'V12345678',
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
      findByEmail: jest.fn().mockResolvedValue(null), // ← añadido
      findByCedula: jest.fn().mockResolvedValue(null), // ← añadido
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePassengerUseCase,
        { provide: PASSENGER_REPOSITORY_PORT, useValue: passengerRepo },
      ],
    }).compile();
    useCase = module.get<UpdatePassengerUseCase>(UpdatePassengerUseCase);
  });

  it('should update passenger fields and return updated profile', async () => {
    passengerRepo.findById.mockResolvedValue(mockPassenger);
    const updatedPassenger = new Passenger(
      'passenger-id',
      '+584141234500',
      'new@email.com',
      'hash',
      'Pasajero Nuevo',
      'V87654321',
      null,
      'student',
      false,
      true,
      null,
      null,
      new Date(),
      new Date(),
    );
    passengerRepo.save.mockResolvedValue(updatedPassenger);

    const dto = {
      fullName: 'Pasajero Nuevo',
      email: 'new@email.com',
      cedula: 'V87654321',
      category: 'student',
    };
    const result = await useCase.execute('passenger-id', dto);

    expect(passengerRepo.findById).toHaveBeenCalledWith('passenger-id');
    // Verifica que se validó la unicidad
    expect(passengerRepo.findByEmail).toHaveBeenCalledWith('new@email.com');
    expect(passengerRepo.findByCedula).toHaveBeenCalledWith('V87654321');
    expect(passengerRepo.save).toHaveBeenCalledWith(
      expect.objectContaining(dto),
    );
    expect(result).toMatchObject(dto);
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('should throw NotFoundException if passenger not found', async () => {
    passengerRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute('unknown-id', { fullName: 'Nuevo' }),
    ).rejects.toThrow(NotFoundException);
  });
});
