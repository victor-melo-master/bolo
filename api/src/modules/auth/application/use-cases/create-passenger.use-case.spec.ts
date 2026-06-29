// auth/application/use-cases/create-passenger.use-case.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePassengerUseCase } from './create-passanger.use-case';
import { PASSENGER_REPOSITORY_PORT } from '../../domain/interfaces/repositories/passenger.repository.port';
import { WALLET_SERVICE_PORT } from '../../../fin/domain/interfaces/services/wallet.service.port';
import { CryptoService } from '../../../../shared/application/services/crypto.service';
import { UserAlreadyExistsException } from '../../domain/exceptions/user-already-exists.exception';
import { Passenger } from '../../domain/entities/passenger.entity';

describe('CreatePassengerUseCase', () => {
  let useCase: CreatePassengerUseCase;
  let passengerRepo: any;
  let walletService: any;
  let cryptoService: any;

  beforeEach(async () => {
    passengerRepo = {
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
        CreatePassengerUseCase,
        { provide: PASSENGER_REPOSITORY_PORT, useValue: passengerRepo },
        { provide: WALLET_SERVICE_PORT, useValue: walletService },
        { provide: CryptoService, useValue: cryptoService },
      ],
    }).compile();

    useCase = module.get<CreatePassengerUseCase>(CreatePassengerUseCase);
  });

  it('should create a passenger successfully', async () => {
    const dto = {
      phone: '+584141234567',
      email: 'test@test.com',
      password: 'password123',
      fullName: 'Test Passenger',
      cedula: 'V12345678',
      category: 'normal' as any,
    };

    passengerRepo.findByPhone.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed_password');
    passengerRepo.save.mockResolvedValue(
      new Passenger(
        'uuid',
        dto.phone,
        dto.email,
        'hashed_password',
        dto.fullName,
        dto.cedula,
        null, // jwtKey
        'normal',
        false,
        true,
        null,
        null,
        new Date(),
        new Date(),
      ),
    );

    const result = await useCase.execute(dto);

    expect(passengerRepo.findByPhone).toHaveBeenCalledWith(dto.phone);
    expect(cryptoService.hash).toHaveBeenCalledWith(dto.password);
    expect(passengerRepo.save).toHaveBeenCalled();
    expect(walletService.createWallet).toHaveBeenCalledWith('uuid');
    expect(result.phone).toBe(dto.phone);
    expect(result.isActive).toBe(true);
  });

  it('should throw UserAlreadyExistsException if phone exists', async () => {
    passengerRepo.findByPhone.mockResolvedValue(
      new Passenger(
        'existing-id',
        '+584141234567',
        null,
        'hash',
        'Test',
        null,
        null,
        'normal',
        false,
        true,
        null,
        null,
        new Date(),
        new Date(),
      ),
    );

    await expect(
      useCase.execute({
        phone: '+584141234567',
        password: 'password123',
        fullName: 'Test',
        category: 'normal' as any,
      }),
    ).rejects.toThrow(UserAlreadyExistsException);

    expect(passengerRepo.save).not.toHaveBeenCalled();
  });

  it('should still create passenger even if wallet service fails', async () => {
    const dto = {
      phone: '+584141234567',
      password: 'password123',
      fullName: 'Test',
      category: 'normal' as any,
    };

    passengerRepo.findByPhone.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed');
    passengerRepo.save.mockResolvedValue(
      new Passenger(
        'uuid',
        dto.phone,
        null,
        'hashed',
        dto.fullName,
        null,
        null,
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

    const result = await useCase.execute(dto);
    expect(result).toBeDefined();
    expect(walletService.createWallet).toHaveBeenCalled();
  });
});
