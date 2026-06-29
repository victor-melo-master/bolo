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
      findByEmail: jest.fn(),
      findByCedula: jest.fn(),
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
      phone: '04141234501',
      email: 'admin@test.com',
      password: 'password123',
      fullName: 'Admin Test',
      cedula: 'V87654321',
      role: 'super_admin' as any,
    };

    adminRepo.findByPhone.mockResolvedValue(null);
    adminRepo.findByEmail.mockResolvedValue(null);
    adminRepo.findByCedula.mockResolvedValue(null);
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

    const result = await useCase.execute(dto);

    expect(adminRepo.findByPhone).toHaveBeenCalledWith(dto.phone);
    expect(adminRepo.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(adminRepo.findByCedula).toHaveBeenCalledWith(dto.cedula);
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
        '04141234501',
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
        phone: '04141234501',
        password: 'password123',
        fullName: 'Test',
        role: 'super_admin' as any,
      }),
    ).rejects.toThrow(UserAlreadyExistsException);
    expect(adminRepo.save).not.toHaveBeenCalled();
  });

  it('should throw UserAlreadyExistsException if email exists', async () => {
    const dto = {
      phone: '04141234501',
      email: 'dup@admin.com',
      password: 'Pass1234',
      fullName: 'Email Dup',
      role: 'super_admin' as any,
    };
    adminRepo.findByPhone.mockResolvedValue(null);
    adminRepo.findByEmail.mockResolvedValue(
      new Admin(
        'existing-id',
        dto.phone,
        dto.email,
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
    await expect(useCase.execute(dto)).rejects.toThrow(
      UserAlreadyExistsException,
    );
  });

  it('should throw UserAlreadyExistsException if cedula exists', async () => {
    const dto = {
      phone: '04141234501',
      cedula: 'V12345678',
      password: 'Pass1234',
      fullName: 'Cedula Dup',
      role: 'super_admin' as any,
    };
    adminRepo.findByPhone.mockResolvedValue(null);
    adminRepo.findByEmail.mockResolvedValue(null);
    adminRepo.findByCedula.mockResolvedValue(
      new Admin(
        'existing-id',
        dto.phone,
        null,
        'hash',
        'Test',
        dto.cedula,
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
    await expect(useCase.execute(dto)).rejects.toThrow(
      UserAlreadyExistsException,
    );
  });

  it('should still create admin even if wallet service fails', async () => {
    const dto = {
      phone: '04141234501',
      password: 'password123',
      fullName: 'Test',
      role: 'super_admin' as any,
    };
    adminRepo.findByPhone.mockResolvedValue(null);
    adminRepo.findByEmail.mockResolvedValue(null);
    adminRepo.findByCedula.mockResolvedValue(null);
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

  it('should create an admin with driver role', async () => {
    const dto = {
      phone: '04161234567',
      password: 'Pass1234',
      fullName: 'Conductor',
      role: 'driver' as any,
    };
    adminRepo.findByPhone.mockResolvedValue(null);
    adminRepo.findByEmail.mockResolvedValue(null);
    adminRepo.findByCedula.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed');
    adminRepo.save.mockResolvedValue(
      new Admin(
        'uuid',
        dto.phone,
        null,
        'hashed',
        dto.fullName,
        null,
        'driver',
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
    const result = await useCase.execute(dto);
    expect(result.role).toBe('driver');
  });

  it('should create an admin with association_admin role', async () => {
    const dto = {
      phone: '04261234567',
      password: 'Pass1234',
      fullName: 'Admin de Asociación',
      role: 'association_admin' as any,
    };
    adminRepo.findByPhone.mockResolvedValue(null);
    adminRepo.findByEmail.mockResolvedValue(null);
    adminRepo.findByCedula.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed');
    adminRepo.save.mockResolvedValue(
      new Admin(
        'uuid',
        dto.phone,
        null,
        'hashed',
        dto.fullName,
        null,
        'association_admin',
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
    const result = await useCase.execute(dto);
    expect(result.role).toBe('association_admin');
  });

  it('should create an admin without optional fields (email, cedula)', async () => {
    const dto = {
      phone: '04221234567',
      password: 'Pass1234',
      fullName: 'Sin Opcionales',
      role: 'super_admin' as any,
    };
    adminRepo.findByPhone.mockResolvedValue(null);
    adminRepo.findByEmail.mockResolvedValue(null);
    adminRepo.findByCedula.mockResolvedValue(null);
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
    const result = await useCase.execute(dto);
    expect(result.email).toBeNull();
    expect(result.cedula).toBeNull();
  });

  it('should propagate error if repository save fails', async () => {
    const dto = {
      phone: '04121234567',
      password: 'Pass1234',
      fullName: 'Error al guardar',
      role: 'super_admin' as any,
    };
    adminRepo.findByPhone.mockResolvedValue(null);
    adminRepo.findByEmail.mockResolvedValue(null);
    adminRepo.findByCedula.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed');
    adminRepo.save.mockRejectedValue(new Error('DB error'));
    await expect(useCase.execute(dto)).rejects.toThrow('DB error');
  });

  it('should pass phone exactly as provided (no normalization)', async () => {
    const dto = {
      phone: '04141234567',
      password: 'Pass1234',
      fullName: 'Teléfono',
      role: 'super_admin' as any,
    };
    adminRepo.findByPhone.mockResolvedValue(null);
    adminRepo.findByEmail.mockResolvedValue(null);
    adminRepo.findByCedula.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed');
    adminRepo.save.mockImplementation((admin: Admin) => Promise.resolve(admin));
    const result = await useCase.execute(dto);
    expect(result.phone).toBe('04141234567');
  });

  it('should create an admin with passport as cedula', async () => {
    const dto = {
      phone: '04121234567',
      password: 'Pass1234',
      fullName: 'Pasaporte',
      cedula: 'AB123456', // pasaporte válido
      role: 'super_admin' as any,
    };
    adminRepo.findByPhone.mockResolvedValue(null);
    adminRepo.findByEmail.mockResolvedValue(null);
    adminRepo.findByCedula.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed');
    adminRepo.save.mockResolvedValue(
      new Admin(
        'uuid',
        dto.phone,
        null,
        'hashed',
        dto.fullName,
        dto.cedula,
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

    const result = await useCase.execute(dto);

    expect(result.cedula).toBe('AB123456');
  });
});
