// auth/infrastructure/persistence/passenger.repository.impl.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * PassengerRepositoryImpl — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el repositorio de pasajeros implemente
 * correctamente las operaciones de persistencia (CRUD).
 *
 * @module test/passenger.repository.impl.spec
 */
import { PassengerRepositoryImpl } from './passenger.repository.impl';
import { Passenger } from '../../domain/entities/passenger.entity';
import { PassengerOrmEntity } from '../orm/passenger.orm-entity';
import { Repository } from 'typeorm';

describe('PassengerRepositoryImpl', () => {
  let repo: PassengerRepositoryImpl;
  let mockOrmRepo: any;

  const mockOrmPassenger: PassengerOrmEntity = {
    id: 'passenger-id',
    phone: '04141234500',
    email: null,
    passwordHash: 'hashed_pass',
    fullName: 'Pasajero Uno',
    cedula: null,
    jwtKey: null,
    category: 'normal',
    studentDocApproved: false,
    isActive: true,
    deletedAt: null,
    lastLoginAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockDomainPassenger = new Passenger(
    'passenger-id',
    '04141234500',
    null,
    'hashed_pass',
    'Pasajero Uno',
    null,
    null,
    'normal',
    false,
    true,
    null,
    null,
    new Date('2026-01-01'),
    new Date('2026-01-01'),
  );

  beforeEach(() => {
    mockOrmRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    repo = new PassengerRepositoryImpl(
      mockOrmRepo as Repository<PassengerOrmEntity>,
    );
  });

  describe('findByPhone', () => {
    it('should return domain passenger when found', async () => {
      mockOrmRepo.findOne.mockResolvedValue(mockOrmPassenger);
      const result = await repo.findByPhone('04141234500');
      expect(result).toBeInstanceOf(Passenger);
      expect(result?.phone).toBe('04141234500');
      expect(mockOrmRepo.findOne).toHaveBeenCalledWith({
        where: { phone: '04141234500' },
      });
    });

    it('should return null when not found', async () => {
      mockOrmRepo.findOne.mockResolvedValue(null);
      const result = await repo.findByPhone('unknown');
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should convert domain to orm and save', async () => {
      mockOrmRepo.save.mockResolvedValue(mockOrmPassenger);
      const result = await repo.save(mockDomainPassenger);
      expect(mockOrmRepo.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Passenger);
      expect(result.id).toBe('passenger-id');
    });
  });

  describe('updateJwtKey', () => {
    it('should call update with correct params', async () => {
      await repo.updateJwtKey('passenger-id', 'new-key');
      expect(mockOrmRepo.update).toHaveBeenCalledWith('passenger-id', {
        jwtKey: 'new-key',
      });
    });
  });
});
