// src/modules/fin/infrastructure/services/wallet.service.impl.spec.ts

import { WalletServiceImpl } from './wallet.service.impl';
import { Wallet } from '../../domain/entities/wallet.entity';
import { CreateWalletUseCase } from '../../application';

describe('WalletServiceImpl', () => {
  let service: WalletServiceImpl;
  let createWalletUseCase: any;

  beforeEach(() => {
    createWalletUseCase = {
      execute: jest.fn(),
    };
    service = new WalletServiceImpl(createWalletUseCase as CreateWalletUseCase);
  });

  it('should call createWalletUseCase.execute with userId', async () => {
    const userId = 'user-123';
    const wallet = new Wallet(
      'wallet-id',
      userId,
      0,
      0,
      false,
      'USD',
      null,
      1,
      new Date(),
      new Date(),
    );
    createWalletUseCase.execute.mockResolvedValue(wallet);

    await service.createWallet(userId);

    expect(createWalletUseCase.execute).toHaveBeenCalledWith(userId, undefined);
  });

  it('should propagate errors from use case', async () => {
    createWalletUseCase.execute.mockRejectedValue(
      new Error('Wallet already exists'),
    );

    await expect(service.createWallet('user-123')).rejects.toThrow(
      'Wallet already exists',
    );
  });
});
