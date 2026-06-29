// auth/application/use-cases/update-passenger.use-case.ts
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import type { PassengerRepositoryPort } from '../../domain/interfaces/repositories/passenger.repository.port';
import { UpdatePassengerDto } from '../dto/update-passenger.dto';
import { PassengerCategory } from '../../domain/entities/passenger.entity';

@Injectable()
export class UpdatePassengerUseCase {
  constructor(
    @Inject(PASSENGER_REPOSITORY_PORT)
    private readonly passengerRepo: PassengerRepositoryPort,
  ) {}

  async execute(passengerId: string, dto: UpdatePassengerDto) {
    const passenger = await this.passengerRepo.findById(passengerId);
    if (!passenger) {
      throw new NotFoundException('Pasajero no encontrado');
    }

    // Solo actualizar los campos enviados
    const { category, ...restDto } = dto;
    const updated = await this.passengerRepo.save({
      ...passenger,
      ...restDto,
      ...(category && { category: category as PassengerCategory }),
    });

    return {
      id: updated.id,
      phone: updated.phone,
      email: updated.email,
      fullName: updated.fullName,
      cedula: updated.cedula,
      category: updated.category,
      isActive: updated.isActive,
      createdAt: updated.createdAt,
    };
  }
}
