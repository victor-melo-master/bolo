// auth/application/use-cases/get-passenger-profile.use-case.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import type { PassengerRepositoryPort } from '../../domain/interfaces/repositories/passenger.repository.port';

@Injectable()
export class GetPassengerProfileUseCase {
  constructor(
    @Inject(PASSENGER_REPOSITORY_PORT)
    private readonly passengerRepo: PassengerRepositoryPort,
  ) {}

  async execute(passengerId: string) {
    const passenger = await this.passengerRepo.findById(passengerId);
    if (!passenger) {
      throw new NotFoundException('Pasajero no encontrado');
    }
    return {
      id: passenger.id,
      phone: passenger.phone,
      email: passenger.email,
      fullName: passenger.fullName,
      cedula: passenger.cedula,
      category: passenger.category,
      studentDocApproved: passenger.studentDocApproved,
      isActive: passenger.isActive,
      createdAt: passenger.createdAt,
    };
  }
}
