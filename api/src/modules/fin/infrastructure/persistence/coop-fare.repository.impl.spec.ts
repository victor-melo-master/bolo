// fin/infrastructure/persistence/coop-fare.repository.impl.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CoopFareRepositoryImpl — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el repositorio de tarifas de cooperativa
 * implemente correctamente las operaciones de persistencia.
 *
 * @module test/coop-fare.repository.impl.spec
 */
import { CoopFareRepositoryImpl } from './coop-fare.repository.impl';
import { CoopFare } from '../../domain/entities/coop-fare.entity';
import { CoopFareOrmEntity } from '../orm/coop-fare.orm-entity';
import { Repository } from 'typeorm';

describe('CoopFareRepositoryImpl', () => {
  let repo: CoopFareRepositoryImpl;
  let mockOrmRepo: any;

  const mockOrmCoopFare: CoopFareOrmEntity = {
    id: 'fare-id',
    associationId: 'assoc-id',
    name: 'Tarifa Estándar',
    baseAmountUsd: 150,
    exchangeRateId: 'rate-id',
    surchargeNormal: 0,
    surchargeStudent: -50,
    surchargeElderly: -30,
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockDomainCoopFare = new CoopFare(
    'fare-id',
    'assoc-id',
    'Tarifa Estándar',
    150,
    'rate-id',
    0,
    -50,
    -30,
    true,
    new Date('2026-01-01'),
    new Date('2026-01-01'),
  );

  beforeEach(() => {
    mockOrmRepo = {
      find: jest.fn(),
      save: jest.fn(),
    };
    repo = new CoopFareRepositoryImpl(
      mockOrmRepo as Repository<CoopFareOrmEntity>,
    );
  });

  describe('save', () => {
    it('should convert domain to orm and save', async () => {
      mockOrmRepo.save.mockResolvedValue(mockOrmCoopFare);

      const result = await repo.save(mockDomainCoopFare);

      expect(mockOrmRepo.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(CoopFare);
      expect(result.id).toBe('fare-id');
      expect(result.name).toBe('Tarifa Estándar');
      expect(result.baseAmountUsd).toBe(150);
    });
  });

  describe('findByAssociationId', () => {
    it('should return domain entities for a given association', async () => {
      mockOrmRepo.find.mockResolvedValue([mockOrmCoopFare]);

      const result = await repo.findByAssociationId('assoc-id');

      expect(mockOrmRepo.find).toHaveBeenCalledWith({
        where: { associationId: 'assoc-id' },
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(CoopFare);
      expect(result[0].associationId).toBe('assoc-id');
    });

    it('should return empty array if no fares found', async () => {
      mockOrmRepo.find.mockResolvedValue([]);
      const result = await repo.findByAssociationId('unknown');
      expect(result).toEqual([]);
    });
  });
});
