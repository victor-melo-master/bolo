// auth/application/use-cases/delete-passenger.use-case.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import type { PassengerRepositoryPort } from '../../domain/interfaces/repositories/passenger.repository.port';

@Injectable()
export class DeletePassengerUseCase {
  constructor(
    @Inject(PASSENGER_REPOSITORY_PORT)
    private readonly passengerRepo: PassengerRepositoryPort,
  ) {}

  async execute(passengerId: string): Promise<void> {
    const passenger = await this.passengerRepo.findById(passengerId);
    if (!passenger) {
      throw new NotFoundException('Pasajero no encontrado');
    }
    // Soft delete: marcamos deletedAt y desactivamos
    await this.passengerRepo.save({
      ...passenger,
      isActive: false,
      deletedAt: new Date(),
    });
  }
}
