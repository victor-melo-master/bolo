// auth/application/use-cases/get-admin-profile.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * GetAdminProfileUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso obtenga el perfil de un
 * administrador por ID y lance NotFoundException si no existe.
 *
 * @module test/get-admin-profile.use-case.spec
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetAdminProfileUseCase } from './get-admin-profile.use-case';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import { Admin } from '../../domain/entities/admin.entity';

describe('GetAdminProfileUseCase', () => {
  let useCase: GetAdminProfileUseCase;
  let adminRepo: any;

  const mockAdmin = new Admin(
    'admin-id',
    '+584141234501',
    'admin@email.com',
    'hash',
    'Admin Uno',
    'V87654321',
    'super_admin',
    null,
    null,
    1,
    null,
    true,
    null,
    null,
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    adminRepo = { findById: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAdminProfileUseCase,
        { provide: ADMIN_REPOSITORY_PORT, useValue: adminRepo },
      ],
    }).compile();
    useCase = module.get<GetAdminProfileUseCase>(GetAdminProfileUseCase);
  });

  it('should return admin profile', async () => {
    adminRepo.findById.mockResolvedValue(mockAdmin);
    const result = await useCase.execute('admin-id');
    expect(result).toMatchObject({ id: 'admin-id', role: 'super_admin' });
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('should throw NotFoundException if admin not found', async () => {
    adminRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('unknown')).rejects.toThrow(NotFoundException);
  });
});
