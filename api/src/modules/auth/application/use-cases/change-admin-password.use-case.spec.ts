// auth/application/use-cases/change-admin-password.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * ChangeAdminPasswordUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso cambie la contraseña de un
 * administrador validando la contraseña actual y manejando errores.
 *
 * @module test/change-admin-password.use-case.spec
 */
// auth/application/use-cases/change-admin-password.use-case.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ChangeAdminPasswordUseCase } from './change-admin-password.use-case';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import { SESSION_REPOSITORY_PORT } from '../../domain/interfaces'; // <-- añadido
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { Admin } from '../../domain/entities/admin.entity';

describe('ChangeAdminPasswordUseCase', () => {
  let useCase: ChangeAdminPasswordUseCase;
  let adminRepo: any;
  let cryptoService: any;
  let sessionRepo: any; // <-- añadido

  const mockAdmin = new Admin(
    'admin-id',
    '+584141234501',
    null,
    'hashed_current',
    'Admin',
    null,
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
    adminRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    cryptoService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };
    sessionRepo = {
      deactivateAllForUser: jest.fn().mockResolvedValue(undefined), // <-- añadido
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeAdminPasswordUseCase,
        { provide: ADMIN_REPOSITORY_PORT, useValue: adminRepo },
        { provide: CryptoService, useValue: cryptoService },
        { provide: SESSION_REPOSITORY_PORT, useValue: sessionRepo }, // <-- añadido
      ],
    }).compile();

    useCase = module.get<ChangeAdminPasswordUseCase>(
      ChangeAdminPasswordUseCase,
    );
  });

  it('should change password when current password is correct', async () => {
    adminRepo.findById.mockResolvedValue(mockAdmin);
    cryptoService.compare.mockResolvedValue(true);
    cryptoService.hash.mockResolvedValue('new_hashed');

    await useCase.execute('admin-id', {
      currentPassword: 'OldPass1',
      newPassword: 'NewPass2',
      newPasswordConfirmation: 'NewPass2',
    });

    expect(adminRepo.findById).toHaveBeenCalledWith('admin-id');
    expect(cryptoService.compare).toHaveBeenCalledWith(
      'OldPass1',
      'hashed_current',
    );
    expect(cryptoService.hash).toHaveBeenCalledWith('NewPass2');
    expect(adminRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'new_hashed' }),
    );
    // Verifica que se invaliden sesiones activas del admin
    expect(sessionRepo.deactivateAllForUser).toHaveBeenCalledWith(
      'admin-id',
      'admin',
    );
  });

  it('should throw UnauthorizedException if current password is wrong', async () => {
    adminRepo.findById.mockResolvedValue(mockAdmin);
    cryptoService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute('admin-id', {
        currentPassword: 'WrongPass',
        newPassword: 'NewPass2',
        newPasswordConfirmation: 'NewPass2',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(adminRepo.save).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if admin not found', async () => {
    adminRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('unknown-id', {
        currentPassword: 'OldPass1',
        newPassword: 'NewPass2',
        newPasswordConfirmation: 'NewPass2',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(adminRepo.save).not.toHaveBeenCalled();
  });
});
