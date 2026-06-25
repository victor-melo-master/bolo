// src/modules/fin/interfaces/rest/wallet.controller.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * WalletController — Controlador REST de Billeteras
 * ═══════════════════════════════════════════════════════════════
 *
 * Expone endpoints para la gestión de billeteras digitales.
 * Ruta base: /fin/wallets
 *
 * Capa: Interfaces (fin/rest)
 *
 * @module WalletController
 */

// ─── Importaciones de NestJS ───
import { Controller, Post, Body, Inject } from '@nestjs/common';

// ─── Puertos de dominio ───
import { WALLET_SERVICE_PORT } from '../../domain/interfaces/services/wallet.service.port';
import type { WalletServicePort } from '../../domain/interfaces/services/wallet.service.port';

// ─── DTOs de aplicación ───
import { CreateWalletDto } from '../../application/dto/create-wallet.dto';

@Controller('fin/wallets')
export class WalletController {
  constructor(
    @Inject(WALLET_SERVICE_PORT) // Inyecta la implementación registrada en FinModule
    private readonly walletService: WalletServicePort,
  ) {}

  @Post()
  async createWallet(@Body() dto: CreateWalletDto) {
    // Crea una billetera para el usuario. El DTO se valida automáticamente
    // via ValidationPipe global de NestJS (class-validator).
    await this.walletService.createWallet(dto.userId, dto.currency);
    return { message: 'Wallet created successfully' };
  }
}
