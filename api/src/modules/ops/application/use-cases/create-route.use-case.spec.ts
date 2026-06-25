// ops/application/use-cases/create-route.use-case.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CreateRouteUseCase } from './create-route.use-case';
import { ROUTE_REPOSITORY_PORT } from '../../domain/interfaces/repositories/route.repository.port';
import { COOP_FARE_REPOSITORY_PORT } from '../../../fin/domain/interfaces/repositories/coop-fare.repository.port';
import { Route } from '../../domain/entities/route.entity';
import { CoopFare } from '../../../fin/domain/entities/coop-fare.entity';

describe('CreateRouteUseCase', () => {
  let useCase: CreateRouteUseCase;
  let routeRepo: any;
  let coopFareRepo: any;

  const validDto = {
    name: 'Ruta Centro',
    description: 'Ruta principal',
    coopFareId: 'fare-uuid',
  };

  beforeEach(async () => {
    routeRepo = {
      save: jest.fn(),
    };
    coopFareRepo = {
      findByAssociationId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRouteUseCase,
        { provide: ROUTE_REPOSITORY_PORT, useValue: routeRepo },
        { provide: COOP_FARE_REPOSITORY_PORT, useValue: coopFareRepo },
      ],
    }).compile();

    useCase = module.get<CreateRouteUseCase>(CreateRouteUseCase);
  });

  it('should create a route successfully', async () => {
    coopFareRepo.findByAssociationId.mockResolvedValue([
      new CoopFare(
        'fare-uuid',
        'assoc-id',
        'Tarifa',
        150,
        'rate-uuid',
        0,
        0,
        0,
        true,
        new Date(),
        new Date(),
      ),
    ]);
    routeRepo.save.mockResolvedValue(
      new Route(
        'route-id',
        'assoc-id',
        validDto.name,
        validDto.description,
        validDto.coopFareId,
        true,
        new Date(),
        new Date(),
      ),
    );

    const result = await useCase.execute('assoc-id', validDto);

    expect(coopFareRepo.findByAssociationId).toHaveBeenCalledWith('assoc-id');
    expect(routeRepo.save).toHaveBeenCalled();
    expect(result.name).toBe(validDto.name);
    expect(result.associationId).toBe('assoc-id');
  });

  it('should throw if coop fare does not belong to association', async () => {
    coopFareRepo.findByAssociationId.mockResolvedValue([]);

    await expect(useCase.execute('assoc-id', validDto)).rejects.toThrow(
      BadRequestException,
    );
  });
});
