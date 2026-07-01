// auth/application/use-cases/update-passenger.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * UpdatePassengerUseCase — Actualización de pasajero
 * ═══════════════════════════════════════════════════════════════
 *
 * Actualiza los datos editables de un pasajero (email, fullName,
 * cedula, category). Lanza NotFoundException si el pasajero no existe.
 *
 * Capa: Aplicación (auth)
 * Dependencias:
 *   - PassengerRepositoryPort: persistencia de pasajeros
 *
 * @module UpdatePassengerUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import type { PassengerRepositoryPort } from '../../domain/interfaces/repositories/passenger.repository.port';
import { UpdatePassengerDto } from '../dto/update-passenger.dto';
import { PassengerCategory } from '../../domain/entities/passenger.entity';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';

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

    if (dto.email && dto.email !== passenger.email) {
      const existingEmail = await this.passengerRepo.findByEmail(dto.email);
      if (existingEmail) {
        throw new UserAlreadyExistsException(
          'El email ya está registrado por otro usuario',
        );
      }
    }

    if (dto.cedula && dto.cedula !== passenger.cedula) {
      const existingCedula = await this.passengerRepo.findByCedula(dto.cedula);
      if (existingCedula) {
        throw new UserAlreadyExistsException(
          'La cédula ya está registrada por otro pasajero',
        );
      }
    }

    // Solo actualizar los campos enviados
    const updatedData = {
      ...passenger, // copia las propiedades originales
      fullName: dto.fullName !== undefined ? dto.fullName : passenger.fullName,
      email: dto.email !== undefined ? dto.email : passenger.email,
      cedula: dto.cedula !== undefined ? dto.cedula : passenger.cedula,
      category:
        dto.category !== undefined
          ? (dto.category as PassengerCategory)
          : passenger.category,
    };

    const updated = await this.passengerRepo.save(updatedData);

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
