// auth/application/use-cases/create-passenger.use-case.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CreatePassengerUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso cree un pasajero correctamente,
 * valide unicidad de teléfono/email, y maneje errores.
 *
 * @module test/create-passenger.use-case.spec
 */
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
      phone: '04141234567',
      email: 'test@test.com',
      password: 'password123',
      fullName: 'Test Passenger',
      cedula: 'V12345678',
      category: 'normal' as any,
    };

    passengerRepo.findByPhone.mockResolvedValue(null);
    passengerRepo.findByEmail.mockResolvedValue(null);
    passengerRepo.findByCedula.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed_password');
    passengerRepo.save.mockResolvedValue(
      new Passenger(
        'uuid',
        dto.phone,
        dto.email,
        'hashed_password',
        dto.fullName,
        dto.cedula,
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

    const result = await useCase.execute(dto);

    expect(passengerRepo.findByPhone).toHaveBeenCalledWith(dto.phone);
    expect(passengerRepo.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(passengerRepo.findByCedula).toHaveBeenCalledWith(dto.cedula);
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
        '04141234567',
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
        phone: '04141234567',
        password: 'password123',
        fullName: 'Test',
        category: 'normal' as any,
      }),
    ).rejects.toThrow(UserAlreadyExistsException);

    expect(passengerRepo.save).not.toHaveBeenCalled();
  });

  it('should throw UserAlreadyExistsException if email exists', async () => {
    const dto = {
      phone: '04141234567',
      email: 'duplicate@email.com',
      password: 'Pass1234',
      fullName: 'Email Duplicado',
      category: 'normal' as any,
    };

    passengerRepo.findByPhone.mockResolvedValue(null);
    passengerRepo.findByEmail.mockResolvedValue(
      new Passenger(
        'existing-id',
        dto.phone,
        dto.email,
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

    await expect(useCase.execute(dto)).rejects.toThrow(
      UserAlreadyExistsException,
    );
  });

  it('should throw UserAlreadyExistsException if cedula exists', async () => {
    const dto = {
      phone: '04141234567',
      cedula: 'V12345678',
      password: 'Pass1234',
      fullName: 'Cédula Duplicada',
      category: 'normal' as any,
    };

    passengerRepo.findByPhone.mockResolvedValue(null);
    passengerRepo.findByEmail.mockResolvedValue(null);
    passengerRepo.findByCedula.mockResolvedValue(
      new Passenger(
        'existing-id',
        dto.phone,
        null,
        'hash',
        'Test',
        dto.cedula,
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

    await expect(useCase.execute(dto)).rejects.toThrow(
      UserAlreadyExistsException,
    );
  });

  it('should still create passenger even if wallet service fails', async () => {
    const dto = {
      phone: '04141234567',
      password: 'password123',
      fullName: 'Test',
      category: 'normal' as any,
    };

    passengerRepo.findByPhone.mockResolvedValue(null);
    passengerRepo.findByEmail.mockResolvedValue(null);
    passengerRepo.findByCedula.mockResolvedValue(null);
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

  it('should create a passenger with student category and studentDocApproved false', async () => {
    const dto = {
      phone: '04241234567',
      password: 'Pass1234',
      fullName: 'Estudiante',
      category: 'student' as any,
    };

    passengerRepo.findByPhone.mockResolvedValue(null);
    passengerRepo.findByEmail.mockResolvedValue(null);
    passengerRepo.findByCedula.mockResolvedValue(null);
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
        'student',
        false,
        true,
        null,
        null,
        new Date(),
        new Date(),
      ),
    );

    const result = await useCase.execute(dto);

    expect(result.category).toBe('student');
    expect(result.studentDocApproved).toBe(false);
  });

  it('should create a passenger with elderly category', async () => {
    const dto = {
      phone: '04161234567',
      password: 'Pass1234',
      fullName: 'Adulto Mayor',
      category: 'elderly' as any,
    };

    passengerRepo.findByPhone.mockResolvedValue(null);
    passengerRepo.findByEmail.mockResolvedValue(null);
    passengerRepo.findByCedula.mockResolvedValue(null);
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
        'elderly',
        false,
        true,
        null,
        null,
        new Date(),
        new Date(),
      ),
    );

    const result = await useCase.execute(dto);

    expect(result.category).toBe('elderly');
    expect(result.isActive).toBe(true);
  });

  it('should create a passenger without optional fields (email, cedula)', async () => {
    const dto = {
      phone: '04261234567',
      password: 'Pass1234',
      fullName: 'Sin Opcionales',
      category: 'normal' as any,
    };

    passengerRepo.findByPhone.mockResolvedValue(null);
    passengerRepo.findByEmail.mockResolvedValue(null);
    passengerRepo.findByCedula.mockResolvedValue(null);
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

    const result = await useCase.execute(dto);

    expect(result.email).toBeNull();
    expect(result.cedula).toBeNull();
  });

  it('should propagate error if repository save fails', async () => {
    const dto = {
      phone: '04121234567',
      password: 'Pass1234',
      fullName: 'Error al guardar',
      category: 'normal' as any,
    };

    passengerRepo.findByPhone.mockResolvedValue(null);
    passengerRepo.findByEmail.mockResolvedValue(null);
    passengerRepo.findByCedula.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed');
    passengerRepo.save.mockRejectedValue(new Error('DB error'));

    await expect(useCase.execute(dto)).rejects.toThrow('DB error');
  });

  it('should create a passenger with passport as cedula', async () => {
    const dto = {
      phone: '04141234567',
      email: 'passenger@passport.com',
      password: 'Pass1234',
      fullName: 'Pasaporte Pasajero',
      cedula: 'A1234567', // pasaporte válido
      category: 'normal' as any,
    };

    passengerRepo.findByPhone.mockResolvedValue(null);
    passengerRepo.findByEmail.mockResolvedValue(null);
    passengerRepo.findByCedula.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed_passport');
    passengerRepo.save.mockResolvedValue(
      new Passenger(
        'uuid',
        dto.phone,
        dto.email,
        'hashed_passport',
        dto.fullName,
        dto.cedula,
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

    const result = await useCase.execute(dto);

    expect(result.cedula).toBe('A1234567');
    expect(result.email).toBe('passenger@passport.com');
    expect(passengerRepo.findByCedula).toHaveBeenCalledWith('A1234567');
  });

  it('should pass phone exactly as provided (no normalization)', async () => {
    const dto = {
      phone: '04141234567',
      password: 'Pass1234',
      fullName: 'Teléfono',
      category: 'normal' as any,
    };

    passengerRepo.findByPhone.mockResolvedValue(null);
    passengerRepo.findByEmail.mockResolvedValue(null);
    passengerRepo.findByCedula.mockResolvedValue(null);
    cryptoService.hash.mockResolvedValue('hashed');
    passengerRepo.save.mockImplementation((passenger: Passenger) =>
      Promise.resolve(passenger),
    );

    const result = await useCase.execute(dto);

    expect(result.phone).toBe('04141234567');
  });
});
