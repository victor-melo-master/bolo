// fin/application/use-cases/create-coop-fare.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateCoopFareUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso cree una tarifa de cooperativa
 * correctamente y maneje errores de validación.
 *
 * @module test/create-coop-fare.use-case.spec
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateCoopFareUseCase } from './create-coop-fare.use-case';
import { COOP_FARE_REPOSITORY_PORT } from '../../domain/interfaces/repositories/coop-fare.repository.port';
import { EXCHANGE_RATE_REPOSITORY_PORT } from '../../domain/interfaces/repositories/exchange-rate.repository.port';
import { CoopFare } from '../../domain/entities/coop-fare.entity';
import { ExchangeRate } from '../../domain/entities/exchange-rate.entity';

describe('CreateCoopFareUseCase', () => {
  let useCase: CreateCoopFareUseCase;
  let coopFareRepo: any;
  let exchangeRateRepo: any;

  const validDto = {
    name: 'Tarifa Test',
    baseAmountUsd: 150,
    exchangeRateId: 'rate-uuid',
  };

  beforeEach(async () => {
    coopFareRepo = {
      save: jest.fn(),
      findByAssociationId: jest.fn(),
    };
    exchangeRateRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCoopFareUseCase,
        { provide: COOP_FARE_REPOSITORY_PORT, useValue: coopFareRepo },
        { provide: EXCHANGE_RATE_REPOSITORY_PORT, useValue: exchangeRateRepo },
      ],
    }).compile();

    useCase = module.get<CreateCoopFareUseCase>(CreateCoopFareUseCase);
  });

  it('should create a coop fare successfully', async () => {
    exchangeRateRepo.findById.mockResolvedValue(
      new ExchangeRate(
        'rate-uuid',
        'VES',
        36.5,
        new Date(),
        new Date(),
        new Date(),
      ),
    );
    coopFareRepo.findByAssociationId.mockResolvedValue([]);
    coopFareRepo.save.mockResolvedValue(
      new CoopFare(
        'fare-id',
        'assoc-id',
        validDto.name,
        validDto.baseAmountUsd,
        validDto.exchangeRateId,
        0,
        -50,
        -30,
        true,
        new Date(),
        new Date(),
      ),
    );

    const result = await useCase.execute('assoc-id', validDto);

    expect(exchangeRateRepo.findById).toHaveBeenCalledWith('rate-uuid');
    expect(coopFareRepo.findByAssociationId).toHaveBeenCalledWith('assoc-id');
    expect(coopFareRepo.save).toHaveBeenCalled();
    expect(result.name).toBe(validDto.name);
    expect(result.associationId).toBe('assoc-id');
  });

  it('should throw if exchange rate not found', async () => {
    exchangeRateRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('assoc-id', validDto)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw if fare name already exists in association', async () => {
    exchangeRateRepo.findById.mockResolvedValue(
      new ExchangeRate(
        'rate-uuid',
        'VES',
        36.5,
        new Date(),
        new Date(),
        new Date(),
      ),
    );
    coopFareRepo.findByAssociationId.mockResolvedValue([
      new CoopFare(
        'old-id',
        'assoc-id',
        validDto.name,
        100,
        'rate-uuid',
        0,
        0,
        0,
        true,
        new Date(),
        new Date(),
      ),
    ]);

    await expect(useCase.execute('assoc-id', validDto)).rejects.toThrow(
      BadRequestException,
    );
  });
});
