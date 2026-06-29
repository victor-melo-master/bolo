// auth/application/use-cases/delete-passenger.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * DeletePassengerUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso elimine un pasajero por ID
 * y lance NotFoundException si no existe.
 *
 * @module test/delete-passenger.use-case.spec
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeletePassengerUseCase } from './delete-passenger.use-case';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import { Passenger } from '../../domain/entities/passenger.entity';

describe('DeletePassengerUseCase', () => {
  let useCase: DeletePassengerUseCase;
  let passengerRepo: any;

  beforeEach(async () => {
    passengerRepo = {
      findById: jest.fn(),
      softDelete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePassengerUseCase,
        { provide: PASSENGER_REPOSITORY_PORT, useValue: passengerRepo },
      ],
    }).compile();
    useCase = module.get<DeletePassengerUseCase>(DeletePassengerUseCase);
  });

  it('should soft delete a passenger', async () => {
    passengerRepo.findById.mockResolvedValue({ id: 'passenger-id' });
    await useCase.execute('passenger-id');
    expect(passengerRepo.findById).toHaveBeenCalledWith('passenger-id');
    expect(passengerRepo.softDelete).toHaveBeenCalledWith('passenger-id');
  });

  it('should throw NotFoundException if passenger not found', async () => {
    passengerRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('unknown-id')).rejects.toThrow(NotFoundException);
    expect(passengerRepo.softDelete).not.toHaveBeenCalled();
  });
});
