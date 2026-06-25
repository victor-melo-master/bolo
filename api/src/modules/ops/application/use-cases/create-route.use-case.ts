// ops/application/use-cases/create-route.use-case.ts
import { ROUTE_REPOSITORY_PORT } from '../../domain/interfaces/repositories/route.repository.port';
import type { RouteRepositoryPort } from '../../domain/interfaces/repositories/route.repository.port';
import { COOP_FARE_REPOSITORY_PORT } from '../../../fin/domain/interfaces/repositories/coop-fare.repository.port';
import type { CoopFareRepositoryPort } from '../../../fin/domain/interfaces/repositories/coop-fare.repository.port';
import { Route } from '../../domain/entities/route.entity';
import { CreateRouteDto } from '../dto/create-route.dto';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';

@Injectable()
export class CreateRouteUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY_PORT)
    private readonly routeRepo: RouteRepositoryPort,
    @Inject(COOP_FARE_REPOSITORY_PORT)
    private readonly coopFareRepo: CoopFareRepositoryPort,
  ) {}

  async execute(associationId: string, dto: CreateRouteDto): Promise<Route> {
    // Validar que el tarifario exista y pertenezca a la misma asociación
    const fares = await this.coopFareRepo.findByAssociationId(associationId);
    const fare = fares.find((f) => f.id === dto.coopFareId);
    if (!fare) {
      throw new BadRequestException(
        'Tarifario no encontrado o no pertenece a tu asociación',
      );
    }

    const route = Route.create({
      associationId,
      name: dto.name,
      description: dto.description,
      coopFareId: dto.coopFareId,
    });

    return this.routeRepo.save(route);
  }
}
