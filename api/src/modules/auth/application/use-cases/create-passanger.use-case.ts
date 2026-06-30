// auth/application/use-cases/create-passenger.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreatePassengerUseCase — Registro de pasajero
 * ═══════════════════════════════════════════════════════════════
 *
 * Orquesta la creación de un nuevo pasajero:
 *   1. Valida que el teléfono no exista
 *   2. Hashea la contraseña
 *   3. Crea la entidad Passenger
 *   4. Persiste en auth.passengers
 *   5. Crea la wallet asociada (side effect opcional)
 *
 * Dependencias inyectadas:
 *   - PassengerRepositoryPort: persistencia de pasajeros
 *   - CryptoService: hashing de contraseñas
 *   - WalletServicePort: creación de billetera (opcional)
 *
 * Capa: Aplicación (auth)
 *
 * @module CreatePassengerUseCase
 */

import { Injectable, Inject, Optional } from '@nestjs/common';
import { WALLET_SERVICE_PORT } from '../../../fin/domain/interfaces/services/wallet.service.port';
import type { WalletServicePort } from '../../../fin/domain/interfaces/services/wallet.service.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import {
  Passenger,
  PassengerCategory,
} from '../../domain/entities/passenger.entity';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces';
import type { PassengerRepositoryPort } from '../../domain/interfaces';
import { CreatePassengerDto } from '../dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class CreatePassengerUseCase {
  // Propiedad de clase (no inyectada)
  private readonly logger = new Logger(CreatePassengerUseCase.name);

  constructor(
    @Inject(PASSENGER_REPOSITORY_PORT)
    private readonly passengerRepo: PassengerRepositoryPort,
    private readonly cryptoService: CryptoService,
    @Optional()
    @Inject(WALLET_SERVICE_PORT)
    private readonly walletService?: WalletServicePort,
  ) {}

  async execute(dto: CreatePassengerDto): Promise<Passenger> {
    // 1. Validar unicidad del teléfono
    const existing = await this.passengerRepo.findByPhone(dto.phone);
    if (existing) {
      throw new UserAlreadyExistsException('El teléfono ya está registrado');
    }

    if (dto.email) {
      const existingEmail = await this.passengerRepo.findByEmail(dto.email);
      if (existingEmail) {
        throw new UserAlreadyExistsException('El email ya está registrado');
      }
    }
    if (dto.cedula) {
      const existingCedula = await this.passengerRepo.findByCedula(dto.cedula);
      if (existingCedula) {
        throw new UserAlreadyExistsException('La cédula ya está registrada');
      }
    }

    // 2. Hashear la contraseña
    const hashedPassword = await this.cryptoService.hash(dto.password);

    // 3. Crear entidad de dominio
    const passenger = Passenger.create({
      phone: dto.phone,
      email: dto.email?.toLocaleLowerCase(),
      passwordHash: hashedPassword,
      fullName: dto.fullName,
      cedula: dto.cedula,
      category: dto.category as PassengerCategory,
    });

    // 4. Persistir
    const saved = await this.passengerRepo.save(passenger);

    // 5. Crear billetera asociada (side effect opcional)
    if (this.walletService) {
      try {
        await this.walletService.createWallet(saved.id);
      } catch (error) {
        this.logger.error(
          'Wallet creation failed, continuing passenger registration',
          error,
        );
      }
    }

    return saved;
  }
}
