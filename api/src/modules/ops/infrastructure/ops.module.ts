// ops/infrastructure/ops.module.ts
// ops/infrastructure/ops.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/infrastructure/auth.module';
import { FinModule } from '../../fin/infrastructure/fin.module'; // Necesita COOP_FARE_REPOSITORY_PORT

import { RouteOrmEntity } from './orm/route.orm-entity';
import { RouteRepositoryImpl } from './persistence/route.repository.impl';
import { ROUTE_REPOSITORY_PORT } from '../domain/interfaces/repositories/route.repository.port';

import { CreateRouteUseCase } from '../application/use-cases/create-route.use-case';
import { RouteController } from '../interfaces/rest/route.controller';

@Module({
  imports: [AuthModule, FinModule, TypeOrmModule.forFeature([RouteOrmEntity])],
  controllers: [RouteController],
  providers: [
    { provide: ROUTE_REPOSITORY_PORT, useClass: RouteRepositoryImpl },
    CreateRouteUseCase,
  ],
})
export class OpsModule {}
