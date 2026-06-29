// auth/application/use-cases/delete-admin.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * DeleteAdminUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso elimine un administrador por ID
 * y lance NotFoundException si no existe.
 *
 * @module test/delete-admin.use-case.spec
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteAdminUseCase } from './delete-admin.use-case';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';

describe('DeleteAdminUseCase', () => {
  let useCase: DeleteAdminUseCase;
  let adminRepo: any;

  beforeEach(async () => {
    adminRepo = {
      findById: jest.fn(),
      softDelete: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAdminUseCase,
        { provide: ADMIN_REPOSITORY_PORT, useValue: adminRepo },
      ],
    }).compile();
    useCase = module.get<DeleteAdminUseCase>(DeleteAdminUseCase);
  });

  it('should soft delete an admin', async () => {
    adminRepo.findById.mockResolvedValue({ id: 'admin-id' });
    await useCase.execute('admin-id');
    expect(adminRepo.findById).toHaveBeenCalledWith('admin-id');
    expect(adminRepo.softDelete).toHaveBeenCalledWith('admin-id');
  });

  it('should throw NotFoundException if admin not found', async () => {
    adminRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('unknown-id')).rejects.toThrow(NotFoundException);
    expect(adminRepo.softDelete).not.toHaveBeenCalled();
  });
});
