// auth/infrastructure/persistence/session.repository.impl.spec.ts
import { SessionRepositoryImpl } from './session.repository.impl';
import { Session } from '../../domain/entities/session.entity';
import { SessionOrmEntity } from '../orm/session.orm-entity';
import { Repository } from 'typeorm';

describe('SessionRepositoryImpl', () => {
  let repo: SessionRepositoryImpl;
  let mockOrmRepo: any;

  const mockOrmSession: SessionOrmEntity = {
    id: 'session-id',
    userId: 'user-id',
    userType: 'passenger',
    clientType: 'phone',
    jwtKey: 'some-key',
    expiresAt: new Date('2026-12-31'),
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockDomainSession = new Session(
    'session-id',
    'user-id',
    'passenger',
    'phone',
    'some-key',
    new Date('2026-12-31'),
    true,
    new Date('2026-01-01'),
    new Date('2026-01-01'),
  );

  beforeEach(() => {
    mockOrmRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };
    repo = new SessionRepositoryImpl(
      mockOrmRepo as Repository<SessionOrmEntity>,
    );
  });

  describe('findById', () => {
    it('should return domain session when found', async () => {
      mockOrmRepo.findOne.mockResolvedValue(mockOrmSession);
      const result = await repo.findById('session-id');
      expect(result).toBeInstanceOf(Session);
      expect(result?.id).toBe('session-id');
      expect(mockOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'session-id' },
      });
    });

    it('should return null when not found', async () => {
      mockOrmRepo.findOne.mockResolvedValue(null);
      const result = await repo.findById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should convert domain to orm and save', async () => {
      mockOrmRepo.save.mockResolvedValue(mockOrmSession);
      const result = await repo.save(mockDomainSession);
      expect(mockOrmRepo.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Session);
      expect(result.jwtKey).toBe('some-key');
    });
  });

  describe('findActiveByUserAndClient', () => {
    it('should return active session for user and client type', async () => {
      mockOrmRepo.findOne.mockResolvedValue(mockOrmSession);
      const result = await repo.findActiveByUserAndClient(
        'user-id',
        'passenger',
        'phone',
      );
      expect(result).toBeInstanceOf(Session);
      expect(result?.isActive).toBe(true);
      expect(mockOrmRepo.findOne).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          userType: 'passenger',
          clientType: 'phone',
          isActive: true,
        },
      });
    });

    it('should return null if no active session found', async () => {
      mockOrmRepo.findOne.mockResolvedValue(null);
      const result = await repo.findActiveByUserAndClient(
        'user-id',
        'passenger',
        'phone',
      );
      expect(result).toBeNull();
    });
  });

  describe('deactivateAllForUser', () => {
    it('should deactivate all active sessions for a user', async () => {
      await repo.deactivateAllForUser('user-id', 'passenger');
      expect(mockOrmRepo.update).toHaveBeenCalledWith(
        { userId: 'user-id', userType: 'passenger', isActive: true },
        { isActive: false },
      );
    });
  });
});
