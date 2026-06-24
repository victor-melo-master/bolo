// src/modules/auth/infrastructure/persistence/user.repository.impl.spec.ts — Ruta relativa desde src/

import { UserRepositoryImpl } from './user.repository.impl';
import { User } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../orm/user.orm-entity';

describe('UserRepositoryImpl', () => {
  let repo: UserRepositoryImpl;
  let mockTypeOrmRepo: any;

  // Objeto ORM mock que simula el resultado de una consulta a la tabla
  // auth.users con todos los campos que espera el mapper toDomain
  const mockOrmUser: UserOrmEntity = {
    id: 'user-id',
    phone: '+584141234567',
    email: 'test@test.com',
    passwordHash: 'hashed_password',
    fullName: 'Test User',
    cedula: 'V12345678',
    role: 'passenger',
    jwtKey: 'mock-jwt-key',
    qrCode: null,
    qrKey: null,
    qrVersion: 1,
    category: 'normal',
    studentDocApproved: false,
    isActive: true,
    deletedAt: null,
    lastLoginAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  // Entidad de dominio equivalente a mockOrmUser, usada para probar
  // el mapper toOrm (dominio → ORM)
  const mockDomainUser = new User(
    'user-id',
    '+584141234567',
    'test@test.com',
    'hashed_password',
    'Test User',
    'V12345678',
    'passenger',
    'mock-jwt-key',
    null,
    null,
    1,
    'normal',
    false,
    true,
    null,
    null,
    new Date('2026-01-01'),
    new Date('2026-01-01'),
  );

  beforeEach(() => {
    // Mock del repositorio TypeORM con los métodos que usa UserRepositoryImpl
    mockTypeOrmRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    // Se instancia el repositorio con el mock en lugar del real
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    repo = new UserRepositoryImpl(mockTypeOrmRepo);
  });

  describe('save', () => {
    it('should convert domain to orm and save', async () => {
      // Verifica que save() convierte la entidad de dominio a ORM,
      // la persiste, y retorna una entidad de dominio con los datos
      // resultantes (incluyendo los generados por la BD)
      mockTypeOrmRepo.save.mockResolvedValue(mockOrmUser);

      const result = await repo.save(mockDomainUser);

      expect(mockTypeOrmRepo.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(mockOrmUser.id);
      expect(result.phone).toBe(mockOrmUser.phone);
    });
  });

  describe('findById', () => {
    it('should return domain user when found', async () => {
      // Usuario encontrado: debe retornar entidad de dominio
      mockTypeOrmRepo.findOne.mockResolvedValue(mockOrmUser);
      const result = await repo.findById('user-id');
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('user-id');
      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'user-id' },
      });
    });

    it('should return null when not found', async () => {
      // Usuario no encontrado: debe retornar null (no lanzar error)
      mockTypeOrmRepo.findOne.mockResolvedValue(null);
      const result = await repo.findById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('findByPhone', () => {
    it('should find user by phone', async () => {
      // Búsqueda por número telefónico
      mockTypeOrmRepo.findOne.mockResolvedValue(mockOrmUser);
      const result = await repo.findByPhone('+584141234567');
      expect(result?.phone).toBe('+584141234567');
    });
  });

  describe('updateJwtKey', () => {
    it('should call update with correct params', async () => {
      // Verifica que updateJwtKey llama a Repository.update() con
      // el ID y el objeto parcial { jwtKey: 'new-key' }, generando
      // un UPDATE directo en SQL sin cargar la entidad completa
      await repo.updateJwtKey('user-id', 'new-key');
      expect(mockTypeOrmRepo.update).toHaveBeenCalledWith('user-id', {
        jwtKey: 'new-key',
      });
    });
  });
});
