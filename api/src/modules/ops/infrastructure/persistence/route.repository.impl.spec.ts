// ops/infrastructure/persistence/route.repository.impl.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * RouteRepositoryImpl — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el repositorio de rutas implemente
 * correctamente las operaciones de persistencia.
 *
 * @module test/route.repository.impl.spec
 */
import { RouteRepositoryImpl } from './route.repository.impl';
import { Route } from '../../domain/entities/route.entity';
import { RouteOrmEntity } from '../orm/route.orm-entity';
import { Repository } from 'typeorm';

describe('RouteRepositoryImpl', () => {
  let repo: RouteRepositoryImpl;
  let mockOrmRepo: any;

  const mockOrmRoute: RouteOrmEntity = {
    id: 'route-id',
    associationId: 'assoc-id',
    name: 'Ruta Centro',
    description: 'Ruta principal',
    coopFareId: 'fare-id',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockDomainRoute = new Route(
    'route-id',
    'assoc-id',
    'Ruta Centro',
    'Ruta principal',
    'fare-id',
    true,
    new Date('2026-01-01'),
    new Date('2026-01-01'),
  );

  beforeEach(() => {
    mockOrmRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    repo = new RouteRepositoryImpl(mockOrmRepo as Repository<RouteOrmEntity>);
  });

  describe('save', () => {
    it('should convert domain to orm and save', async () => {
      mockOrmRepo.save.mockResolvedValue(mockOrmRoute);
      const result = await repo.save(mockDomainRoute);
      expect(mockOrmRepo.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Route);
      expect(result.id).toBe('route-id');
    });
  });

  describe('findByAssociationId', () => {
    it('should return routes for association', async () => {
      mockOrmRepo.find.mockResolvedValue([mockOrmRoute]);
      const result = await repo.findByAssociationId('assoc-id');
      expect(result).toHaveLength(1);
      expect(result[0].associationId).toBe('assoc-id');
    });
  });

  describe('findById', () => {
    it('should return a route by id', async () => {
      mockOrmRepo.findOne.mockResolvedValue(mockOrmRoute);
      const result = await repo.findById('route-id');
      expect(result).toBeInstanceOf(Route);
      expect(result?.id).toBe('route-id');
    });

    it('should return null if not found', async () => {
      mockOrmRepo.findOne.mockResolvedValue(null);
      const result = await repo.findById('unknown');
      expect(result).toBeNull();
    });
  });
});
