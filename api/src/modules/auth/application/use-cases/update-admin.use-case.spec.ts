// auth/application/use-cases/update-admin.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * UpdateAdminUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso actualice los datos de un
 * administrador y lance NotFoundException si no existe.
 *
 * @module test/update-admin.use-case.spec
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateAdminUseCase } from './update-admin.use-case';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import { Admin } from '../../domain/entities/admin.entity';

describe('UpdateAdminUseCase', () => {
  let useCase: UpdateAdminUseCase;
  let adminRepo: any;

  const mockAdmin = new Admin(
    'admin-id', '+584141234501', 'old@email.com', 'hash',
    'Admin Viejo', 'V12345678', 'super_admin',
    null, null, 1, null, true, null, null, new Date(), new Date(),
  );

  beforeEach(async () => {
    adminRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAdminUseCase,
        { provide: ADMIN_REPOSITORY_PORT, useValue: adminRepo },
      ],
    }).compile();
    useCase = module.get<UpdateAdminUseCase>(UpdateAdminUseCase);
  });

  it('should update admin fields and return updated profile', async () => {
    adminRepo.findById.mockResolvedValue(mockAdmin);
    const updatedAdmin = new Admin(
      'admin-id', '+584141234501', 'new@email.com', 'hash',
      'Admin Nuevo', 'V87654321', 'super_admin',
      null, null, 1, null, true, null, null, new Date(), new Date(),
    );
    adminRepo.save.mockResolvedValue(updatedAdmin);

    const dto = { fullName: 'Admin Nuevo', email: 'new@email.com', cedula: 'V87654321' };
    const result = await useCase.execute('admin-id', dto);

    expect(adminRepo.findById).toHaveBeenCalledWith('admin-id');
    expect(adminRepo.save).toHaveBeenCalledWith(expect.objectContaining(dto));
    expect(result).toMatchObject(dto);
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('should throw NotFoundException if admin not found', async () => {
    adminRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('unknown-id', { fullName: 'Nuevo' })).rejects.toThrow(NotFoundException);
  });
});
