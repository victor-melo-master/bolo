// auth/application/use-cases/change-admin-password.use-case.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ChangeAdminPasswordUseCase } from './change-admin-password.use-case';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { Admin } from '../../domain/entities/admin.entity';

describe('ChangeAdminPasswordUseCase', () => {
  let useCase: ChangeAdminPasswordUseCase;
  let adminRepo: any;
  let cryptoService: any;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChangeAdminPasswordUseCase,
        { provide: ADMIN_REPOSITORY_PORT, useValue: adminRepo },
        { provide: CryptoService, useValue: cryptoService },
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
  });

  it('should throw UnauthorizedException if current password is wrong', async () => {
    adminRepo.findById.mockResolvedValue(mockAdmin);
    cryptoService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute('admin-id', {
        currentPassword: 'WrongPass',
        newPassword: 'NewPass2',
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
      }),
    ).rejects.toThrow(NotFoundException);

    expect(adminRepo.save).not.toHaveBeenCalled();
  });
});
