import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from './login.use-case';
import { USER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/user.repository.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { InvalidCredentialsException } from '../../domain/exceptions/invalid-credentials.exception';
import { User } from '../../domain/entities/user.entity';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepo: any;
  let cryptoService: any;
  let jwtService: any;

  beforeEach(async () => {
    userRepo = {
      findByPhone: jest.fn(),
      updateJwtKey: jest.fn(),
    };
    cryptoService = {
      compare: jest.fn(),
    };
    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        { provide: USER_REPOSITORY_PORT, useValue: userRepo },
        { provide: CryptoService, useValue: cryptoService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
  });

  const mockUser = new User(
    'user-uuid',
    '+584141234567',
    null,
    'hashed_pass',
    'Test User',
    null,
    'passenger',
    null,
    null,
    null,
    1,
    'normal',
    false,
    true, // isActive
    null,
    null,
    new Date(),
    new Date(),
  );

  it('should login successfully and return token', async () => {
    userRepo.findByPhone.mockResolvedValue(mockUser);
    cryptoService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('mocked_token');

    const result = await useCase.execute('+584141234567', 'password123');

    expect(userRepo.findByPhone).toHaveBeenCalledWith('+584141234567');
    expect(cryptoService.compare).toHaveBeenCalledWith(
      'password123',
      'hashed_pass',
    );
    expect(userRepo.updateJwtKey).toHaveBeenCalled(); // verifica que rota llave
    expect(jwtService.sign).toHaveBeenCalled();
    expect(result.accessToken).toBe('mocked_token');
    expect(result.user.id).toBe('user-uuid');
  });

  it('should throw InvalidCredentialsException if user not found', async () => {
    userRepo.findByPhone.mockResolvedValue(null);
    await expect(useCase.execute('123', 'pass')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw InvalidCredentialsException if password invalid', async () => {
    userRepo.findByPhone.mockResolvedValue(mockUser);
    cryptoService.compare.mockResolvedValue(false);
    await expect(useCase.execute('+584141234567', 'wrongpass')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should throw InvalidCredentialsException if user inactive', async () => {
    const inactiveUser = { ...mockUser, isActive: false };
    userRepo.findByPhone.mockResolvedValue(inactiveUser);
    await expect(useCase.execute('+584141234567', 'pass')).rejects.toThrow(
      InvalidCredentialsException,
    );
  });

  it('should update jwtKey on successful login', async () => {
    userRepo.findByPhone.mockResolvedValue(mockUser);
    cryptoService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('token');
    await useCase.execute('+584141234567', 'pass');
    expect(userRepo.updateJwtKey).toHaveBeenCalledWith(
      'user-uuid',
      expect.any(String),
    );
  });
});
