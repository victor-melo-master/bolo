/**
 * ═══════════════════════════════════════════════════════════════
 * CreateWalletUseCase — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el caso de uso cree una billetera correctamente
 * y maneje errores de duplicado.
 *
 * @module test/create-wallet.use-case.spec
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CreateWalletUseCase } from './create-wallet.use-case';
import { WALLET_REPOSITORY_PORT } from '../../domain/interfaces/repositories/wallet.repository.port';
import { Wallet } from '../../domain/entities/wallet.entity';

describe('CreateWalletUseCase', () => {
  let useCase: CreateWalletUseCase;
  let walletRepo: any;

  beforeEach(async () => {
    walletRepo = {
      findByUserId: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateWalletUseCase,
        { provide: WALLET_REPOSITORY_PORT, useValue: walletRepo },
      ],
    }).compile();

    useCase = module.get<CreateWalletUseCase>(CreateWalletUseCase);
  });

  it('should create a new wallet', async () => {
    walletRepo.findByUserId.mockResolvedValue(null);
    walletRepo.save.mockResolvedValue(
      new Wallet(
        'uuid',
        'user-id',
        0,
        0,
        false,
        'USD',
        null,
        1,
        new Date(),
        new Date(),
      ),
    );

    const result = await useCase.execute('user-id');

    expect(walletRepo.findByUserId).toHaveBeenCalledWith('user-id');
    expect(walletRepo.save).toHaveBeenCalled();
    expect(result.userId).toBe('user-id');
    expect(result.balance).toBe(0);
  });

  it('should throw error if wallet already exists', async () => {
    walletRepo.findByUserId.mockResolvedValue(
      new Wallet(
        'uuid',
        'user-id',
        0,
        0,
        false,
        'USD',
        null,
        1,
        new Date(),
        new Date(),
      ),
    );

    await expect(useCase.execute('user-id')).rejects.toThrow(
      'Wallet already exists',
    );
  });
});
