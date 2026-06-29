// auth/application/use-cases/get-passenger-profile.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * GetPassengerProfileUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso obtenga el perfil de un
 * pasajero por ID y lance NotFoundException si no existe.
 *
 * @module test/get-passenger-profile.use-case.spec
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetPassengerProfileUseCase } from './get-passenger-profile.use-case';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import { Passenger } from '../../domain/entities/passenger.entity';

describe('GetPassengerProfileUseCase', () => {
  let useCase: GetPassengerProfileUseCase;
  let passengerRepo: any;

  const mockPassenger = new Passenger(
    'passenger-id',
    '+584141234500',
    'test@email.com',
    'hash',
    'Pasajero Uno',
    'V12345678',
    null,
    'student',
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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPassengerProfileUseCase,
        { provide: PASSENGER_REPOSITORY_PORT, useValue: passengerRepo },
      ],
    }).compile();

    useCase = module.get<GetPassengerProfileUseCase>(GetPassengerProfileUseCase);
  });

  it('should return passenger profile when found', async () => {
    passengerRepo.findById.mockResolvedValue(mockPassenger);

    const result = await useCase.execute('passenger-id');

    expect(result).toMatchObject({
      id: 'passenger-id',
      phone: '+584141234500',
      email: 'test@email.com',
      fullName: 'Pasajero Uno',
      cedula: 'V12345678',
      category: 'student',
      isActive: true,
    });
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('jwtKey');
  });

  it('should throw NotFoundException if passenger not found', async () => {
    passengerRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('unknown-id')).rejects.toThrow(NotFoundException);
  });
});
