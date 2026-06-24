import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.use-case';
import { USER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/user.repository.port';
import { WALLET_SERVICE_PORT } from '../../domain/interfaces/services/wallet.service.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { User } from '../../domain/entities/user.entity';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepo: any;
  let walletService: any;
  let cryptoService: any;

  beforeEach(async () => {
    userRepo = {
      findByPhone: jest.fn(),
      save: jest.fn(),
      updateJwtKey: jest.fn(),
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
        CreateUserUseCase,
        { provide: USER_REPOSITORY_PORT, useValue: userRepo },
        { provide: WALLET_SERVICE_PORT, useValue: walletService },
        { provide: CryptoService, useValue: cryptoService },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  it('should create a user successfully', async () => {
    const dto = {
      phone: '+584141234567',
      email: 'test@test.com',
      password: 'password123',
      fullName: 'Test User',
      cedula: 'V12345678',
      role: 'passenger' as any,
      category: 'normal' as any,
    };

    userRepo.findByPhone.mockResolvedValue(null); // no existe
    cryptoService.hash.mockResolvedValue('hashed_password');
    userRepo.save.mockResolvedValue(
      new User(
        'uuid',
        dto.phone,
        dto.email,
        'hashed_password',
        dto.fullName,
        dto.cedula,
        dto.role,
        null, // jwtKey
        null, // qrCode
        null, // qrKey
        1,
        dto.category,
        false,
        true,
        null,
        null,
        new Date(),
        new Date(),
      ),
    );

    const result = await useCase.execute(dto);

    expect(userRepo.findByPhone).toHaveBeenCalledWith(dto.phone);
    expect(cryptoService.hash).toHaveBeenCalledWith(dto.password);
    expect(userRepo.save).toHaveBeenCalled();
    expect(walletService.createWallet).toHaveBeenCalledWith('uuid');
    expect(result.phone).toBe(dto.phone);
    expect(result.isActive).toBe(true);
  });

  it('should throw UserAlreadyExistsException if phone exists', async () => {
    const dto = {
      phone: '+584141234567',
      password: 'password123',
      fullName: 'Test User',
      role: 'passenger' as any,
      category: 'normal' as any,
    };

    userRepo.findByPhone.mockResolvedValue(
      new User(
        'existing-id',
        dto.phone,
        null,
        'hash',
        dto.fullName,
        null,
        'passenger',
        null,
        null,
        null,
        1,
        'normal',
        false,
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
    expect(userRepo.save).not.toHaveBeenCalled();
  });

  it('should still create user even if wallet service fails (optional)', async () => {
    const dto = {
      phone: '+584141234567',
      password: 'password123',
      fullName: 'Test User',
      role: 'passenger' as any,
      category: 'normal' as any,
    };

    userRepo.findByPhone.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed');
    userRepo.save.mockResolvedValue(
      new User(
        'uuid',
        dto.phone,
        null,
        'hashed',
        dto.fullName,
        null,
        'passenger',
        null,
        null,
        null,
        1,
        'normal',
        false,
        true,
        null,
        null,
        new Date(),
        new Date(),
      ),
    );
    walletService.createWallet.mockRejectedValue(new Error('wallet error'));

    // Como el caso de uso actual no captura error de wallet (es opcional con ?.), no debería fallar
    const result = await useCase.execute(dto);
    expect(result).toBeDefined();
    expect(walletService.createWallet).toHaveBeenCalled();
  });
});
