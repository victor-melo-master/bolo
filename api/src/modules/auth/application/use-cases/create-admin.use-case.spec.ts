// auth/application/use-cases/create-admin.use-case.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAdminUseCase } from './create-admin.use-case';
import { ADMIN_REPOSITORY_PORT } from '../../domain/interfaces/repositories/admin.repository.port';
import { WALLET_SERVICE_PORT } from '../../../fin/domain/interfaces/services/wallet.service.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { Admin } from '../../domain/entities/admin.entity';

describe('CreateAdminUseCase', () => {
  let useCase: CreateAdminUseCase;
  let adminRepo: any;
  let walletService: any;
  let cryptoService: any;

  beforeEach(async () => {
    adminRepo = {
      findByPhone: jest.fn(),
      save: jest.fn(),
    };
    walletService = {
      createWallet: jest.fn(),
    };
    cryptoService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAdminUseCase,
        { provide: ADMIN_REPOSITORY_PORT, useValue: adminRepo },
        { provide: WALLET_SERVICE_PORT, useValue: walletService },
        { provide: CryptoService, useValue: cryptoService },
      ],
    }).compile();

    useCase = module.get<CreateAdminUseCase>(CreateAdminUseCase);
  });

  it('should create an admin successfully', async () => {
    const dto = {
      phone: '+584141234501',
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Admin Test',
      cedula: 'V87654321',
      role: 'super_admin' as any,
    };

    adminRepo.findByPhone.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed_password');
    adminRepo.save.mockResolvedValue(
      new Admin(
        'uuid',
        dto.phone,
        dto.email,
        'hashed_password',
        dto.fullName,
        dto.cedula,
        'super_admin',
        null, // qrCode
        null, // qrKey
        1, // qrVersion
        null, // associationId
        true,
        null,
        null,
        new Date(),
        new Date(),
      ),
    );

    const result = await useCase.execute(dto);

    expect(adminRepo.findByPhone).toHaveBeenCalledWith(dto.phone);
    expect(cryptoService.hash).toHaveBeenCalledWith(dto.password);
    expect(adminRepo.save).toHaveBeenCalled();
    expect(walletService.createWallet).toHaveBeenCalledWith('uuid');
    expect(result.phone).toBe(dto.phone);
    expect(result.role).toBe('super_admin');
    expect(result.isActive).toBe(true);
  });

  it('should throw UserAlreadyExistsException if phone exists', async () => {
    adminRepo.findByPhone.mockResolvedValue(
      new Admin(
        'existing-id',
        '+584141234501',
        null,
        'hash',
        'Test',
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
      ),
    );

    await expect(
      useCase.execute({
        phone: '+584141234501',
        password: 'password123',
        fullName: 'Test',
        role: 'super_admin' as any,
      }),
    ).rejects.toThrow(UserAlreadyExistsException);

    expect(adminRepo.save).not.toHaveBeenCalled();
  });

  it('should still create admin even if wallet service fails', async () => {
    const dto = {
      phone: '+584141234501',
      password: 'password123',
      fullName: 'Test',
      role: 'super_admin' as any,
    };

    adminRepo.findByPhone.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed');
    adminRepo.save.mockResolvedValue(
      new Admin(
        'uuid',
        dto.phone,
        null,
        'hashed',
        dto.fullName,
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
      ),
    );
    walletService.createWallet.mockRejectedValue(new Error('wallet error'));

    const result = await useCase.execute(dto);
    expect(result).toBeDefined();
    expect(walletService.createWallet).toHaveBeenCalled();
  });
});
