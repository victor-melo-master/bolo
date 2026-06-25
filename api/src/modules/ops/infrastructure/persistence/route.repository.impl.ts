// ops/infrastructure/persistence/route.repository.impl.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteRepositoryPort } from '../../domain/interfaces/repositories/route.repository.port';
import { Route } from '../../domain/entities/route.entity';
import { RouteOrmEntity } from '../orm/route.orm-entity';

@Injectable()
export class RouteRepositoryImpl implements RouteRepositoryPort {
  constructor(
    @InjectRepository(RouteOrmEntity)
    private readonly ormRepo: Repository<RouteOrmEntity>,
  ) {}

  async save(route: Route): Promise<Route> {
    const orm = this.toOrm(route);
    const saved = await this.ormRepo.save(orm);
    return this.toDomain(saved);
  }

  async findByAssociationId(associationId: string): Promise<Route[]> {
    const ormList = await this.ormRepo.find({ where: { associationId } });
    return ormList.map((orm) => this.toDomain(orm));
  }

  async findById(id: string): Promise<Route | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  private toDomain(orm: RouteOrmEntity): Route {
    return new Route(
      orm.id,
      orm.associationId,
      orm.name,
      orm.description,
      orm.coopFareId,
      orm.isActive,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  private toOrm(route: Route): RouteOrmEntity {
    const orm = new RouteOrmEntity();
    orm.id = route.id;
    orm.associationId = route.associationId;
    orm.name = route.name;
    orm.description = route.description;
    orm.coopFareId = route.coopFareId;
    orm.isActive = route.isActive;
    orm.createdAt = route.createdAt;
    orm.updatedAt = route.updatedAt;
    return orm;
  }
}
