// src/modules/fin/infrastructure/services/wallet.service.impl.ts
import { Injectable } from '@nestjs/common';
import { WalletServicePort } from '../../domain/interfaces/services/wallet.service.port';
import { CreateWalletUseCase } from '../../application/use-cases/create-wallet.use-case';

@Injectable()
export class WalletServiceImpl implements WalletServicePort {
  constructor(private readonly createWalletUseCase: CreateWalletUseCase) {}

  async createWallet(userId: string, currency?: string): Promise<void> {
    await this.createWalletUseCase.execute(userId, currency);
  }
}
