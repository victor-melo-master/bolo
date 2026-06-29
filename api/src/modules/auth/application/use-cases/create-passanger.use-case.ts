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
 */

import { Injectable, Inject, Optional } from '@nestjs/common';
import { WALLET_SERVICE_PORT } from '../../../fin/domain/interfaces/services/wallet.service.port';
import type { WalletServicePort } from '../../../fin/domain/interfaces/services/wallet.service.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { Passenger } from '../../domain/entities/passenger.entity';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces';
import type { PassengerRepositoryPort } from '../../domain/interfaces';
import { CreatePassengerDto } from '../dto';

@Injectable()
export class CreatePassengerUseCase {
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

    // 2. Hashear la contraseña
    const hashedPassword = await this.cryptoService.hash(dto.password);

    // 3. Crear entidad de dominio
    const passenger = Passenger.create({
      phone: dto.phone,
      email: dto.email,
      passwordHash: hashedPassword,
      fullName: dto.fullName,
      cedula: dto.cedula,
      category: dto.category as any,
    });

    // 4. Persistir
    const saved = await this.passengerRepo.save(passenger);

    // 5. Crear billetera asociada (side effect opcional)
    if (this.walletService) {
      try {
        await this.walletService.createWallet(saved.id);
      } catch (error) {
        console.error(
          'Wallet creation failed, continuing passenger registration:',
          error,
        );
      }
    }

    return saved;
  }
}
