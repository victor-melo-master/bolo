// auth/application/use-cases/delete-passenger.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * DeletePassengerUseCase — Eliminación lógica de pasajero
 * ═══════════════════════════════════════════════════════════════
 *
 * Realiza un soft-delete de un pasajero: lo marca como eliminado
 * lógicamente (deletedAt) y lo desactiva. Lanza NotFoundException
 * si el pasajero no existe.
 *
 * Capa: Aplicación (auth)
 * Dependencias:
 *   - PassengerRepositoryPort: persistencia de pasajeros
 *
 * @module DeletePassengerUseCase
 */
import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import type { PassengerRepositoryPort } from '../../domain/interfaces/repositories/passenger.repository.port';

@Injectable()
export class DeletePassengerUseCase {
  constructor(
    @Inject(PASSENGER_REPOSITORY_PORT)
    private readonly passengerRepo: PassengerRepositoryPort,
  ) {}

  /**
   *  No se hace necesario valdiar el ID ya que el Guard se encarga del mismo
   * ademas que se busca conel ID valdiado a la persona y se realiza el
   * soft delete
   * @param passengerId
   */

  async execute(passengerId: string): Promise<void> {
    const passenger = await this.passengerRepo.findById(passengerId);
    if (!passenger) {
      throw new NotFoundException('Pasajero no encontrado');
    }

    await this.passengerRepo.softDelete(passengerId);
  }
}
