// auth/application/use-cases/change-passenger-password.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * ChangePassengerPasswordUseCase — Cambio de contraseña de pasajero
 * ═══════════════════════════════════════════════════════════════
 *
 * Valida la contraseña actual de un pasajero y la actualiza
 * por una nueva. Lanza UnauthorizedException si la contraseña actual
 * es incorrecta y NotFoundException si el pasajero no existe.
 *
 * Capa: Aplicación (auth)
 * Dependencias:
 *   - PassengerRepositoryPort: persistencia de pasajeros
 *   - CryptoService: hashing y comparación de contraseñas
 *
 * @module ChangePassengerPasswordUseCase
 */
import {
  Injectable,
  Inject,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import type { PassengerRepositoryPort } from '../../domain/interfaces/repositories/passenger.repository.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { ChangePasswordDto } from '../dto/change-password.dto';

@Injectable()
export class ChangePassengerPasswordUseCase {
  constructor(
    @Inject(PASSENGER_REPOSITORY_PORT)
    private readonly passengerRepo: PassengerRepositoryPort,
    private readonly cryptoService: CryptoService,
  ) {}

  async execute(passengerId: string, dto: ChangePasswordDto): Promise<void> {
    const passenger = await this.passengerRepo.findById(passengerId);
    if (!passenger) {
      throw new NotFoundException('Pasajero no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentValid = await this.cryptoService.compare(
      dto.currentPassword,
      passenger.passwordHash,
    );
    if (!isCurrentValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Hashear nueva contraseña
    const newHash = await this.cryptoService.hash(dto.newPassword);

    // Actualizar
    await this.passengerRepo.save({
      ...passenger,
      passwordHash: newHash,
    });
  }
}
