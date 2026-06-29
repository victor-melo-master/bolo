// fin/application/use-cases/create-coop-fare.use-case.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateCoopFareUseCase — Creación de tarifario de cooperativa
 * ═══════════════════════════════════════════════════════════════
 *
 * Orquesta la creación de un tarifario para una asociación/cooperativa.
 * Valida que la tasa de cambio exista y que el nombre del tarifario
 * no esté duplicado dentro de la misma asociación.
 *
 * Capa: Aplicación (fin)
 * Dependencias:
 *   - CoopFareRepositoryPort: persistencia de tarifarios
 *   - ExchangeRateRepositoryPort: validación de tasa de cambio
 *
 * @module CreateCoopFareUseCase
 */

import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { COOP_FARE_REPOSITORY_PORT } from '../../domain/interfaces/repositories/coop-fare.repository.port';
import type { CoopFareRepositoryPort } from '../../domain/interfaces/repositories/coop-fare.repository.port';
import { EXCHANGE_RATE_REPOSITORY_PORT } from '../../domain/interfaces/repositories/exchange-rate.repository.port';
import type { ExchangeRateRepositoryPort } from '../../domain/interfaces/repositories/exchange-rate.repository.port';
import { CoopFare } from '../../domain/entities/coop-fare.entity';
import { CreateCoopFareDto } from '../dto';

@Injectable()
export class CreateCoopFareUseCase {
  constructor(
    @Inject(COOP_FARE_REPOSITORY_PORT)
    private readonly coopFareRepo: CoopFareRepositoryPort,
    @Inject(EXCHANGE_RATE_REPOSITORY_PORT)
    private readonly exchangeRateRepo: ExchangeRateRepositoryPort,
  ) {}

  async execute(
    associationId: string,
    dto: CreateCoopFareDto,
  ): Promise<CoopFare> {
    // Validar que la tasa de cambio exista
    const rate = await this.exchangeRateRepo.findById(dto.exchangeRateId);
    if (!rate) {
      throw new BadRequestException('Tasa de cambio no encontrada');
    }

    // Validar que el nombre no esté duplicado en la misma asociación
    const existingFares =
      await this.coopFareRepo.findByAssociationId(associationId);
    const duplicate = existingFares.find((f) => f.name === dto.name);
    if (duplicate) {
      throw new BadRequestException(
        'Ya existe un tarifario con ese nombre en tu asociación',
      );
    }

    const coopFare = CoopFare.create({
      associationId,
      name: dto.name,
      baseAmountUsd: dto.baseAmountUsd,
      exchangeRateId: dto.exchangeRateId,
      surchargeNormal: dto.surchargeNormal ?? 0,
      surchargeStudent: dto.surchargeStudent ?? 0,
      surchargeElderly: dto.surchargeElderly ?? 0,
    });

    return this.coopFareRepo.save(coopFare);
  }
}
