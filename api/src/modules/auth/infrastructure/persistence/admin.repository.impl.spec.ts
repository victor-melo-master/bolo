// auth/infrastructure/persistence/admin.repository.impl.spec.ts
import { AdminRepositoryImpl } from './admin.repository.impl';
import { Admin } from '../../domain/entities/admin.entity';
import { AdminOrmEntity } from '../orm/admin.orm-entity';
import { Repository } from 'typeorm';

describe('AdminRepositoryImpl', () => {
  let repo: AdminRepositoryImpl;
  let mockOrmRepo: any;

  const mockOrmAdmin: AdminOrmEntity = {
    id: 'admin-id',
    phone: '+584141234501',
    email: null,
    passwordHash: 'hashed_pass',
    fullName: 'Admin Uno',
    cedula: null,
    role: 'super_admin',
    qrCode: null,
    qrKey: null,
    qrVersion: 1,
    associationId: null,
    isActive: true,
    deletedAt: null,
    lastLoginAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockDomainAdmin = new Admin(
    'admin-id',
    '+584141234501',
    null,
    'hashed_pass',
    'Admin Uno',
    null,
    'super_admin',
    null,
    null,
    1,
    null,
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
    repo = new AdminRepositoryImpl(mockOrmRepo as Repository<AdminOrmEntity>);
  });

  describe('findByPhone', () => {
    it('should return domain admin when found', async () => {
      mockOrmRepo.findOne.mockResolvedValue(mockOrmAdmin);
      const result = await repo.findByPhone('+584141234501');
      expect(result).toBeInstanceOf(Admin);
      expect(result?.phone).toBe('+584141234501');
      expect(mockOrmRepo.findOne).toHaveBeenCalledWith({
        where: { phone: '+584141234501' },
      });
    });

    it('should return null when not found', async () => {
      mockOrmRepo.findOne.mockResolvedValue(null);
      const result = await repo.findByPhone('unknown');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return domain admin by id', async () => {
      mockOrmRepo.findOne.mockResolvedValue(mockOrmAdmin);
      const result = await repo.findById('admin-id');
      expect(result).toBeInstanceOf(Admin);
      expect(result?.id).toBe('admin-id');
    });

    it('should return null if not found', async () => {
      mockOrmRepo.findOne.mockResolvedValue(null);
      const result = await repo.findById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should convert domain to orm and save', async () => {
      mockOrmRepo.save.mockResolvedValue(mockOrmAdmin);
      const result = await repo.save(mockDomainAdmin);
      expect(mockOrmRepo.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Admin);
      expect(result.id).toBe('admin-id');
      expect(result.role).toBe('super_admin');
    });
  });

  describe('updateAssociationId', () => {
    it('should update associationId for admin', async () => {
      await repo.updateAssociationId('admin-id', 'assoc-id');
      expect(mockOrmRepo.update).toHaveBeenCalledWith('admin-id', {
        associationId: 'assoc-id',
      });
    });
  });
});
