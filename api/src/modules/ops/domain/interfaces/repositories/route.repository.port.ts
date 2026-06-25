// ops/domain/interfaces/repositories/route.repository.port.ts
import { Route } from '../../entities/route.entity';

export const ROUTE_REPOSITORY_PORT = 'ROUTE_REPOSITORY_PORT';

export interface RouteRepositoryPort {
  save(route: Route): Promise<Route>;
  findByAssociationId(associationId: string): Promise<Route[]>;
  findById(id: string): Promise<Route | null>;
}
