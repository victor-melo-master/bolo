import { Controller, Post, Body } from '@nestjs/common';
import { WALLET_SERVICE_PORT } from '../../domain/interfaces/services/wallet.service.port';
import type { WalletServicePort } from '../../domain/interfaces/services/wallet.service.port';
import { CreateWalletDto } from '../../application/dto/create-wallet.dto';
import { Inject } from '@nestjs/common';

@Controller('fin/wallets')
export class WalletController {
  constructor(
    @Inject(WALLET_SERVICE_PORT)
    private readonly walletService: WalletServicePort,
  ) {}

  @Post()
  async createWallet(@Body() dto: CreateWalletDto) {
    await this.walletService.createWallet(dto.userId, dto.currency);
    return { message: 'Wallet created successfully' };
  }
}
