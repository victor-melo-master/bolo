// src/modules/fin/application/use-cases/create-wallet.use-case.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CreateWalletUseCase — Caso de Uso: Crear Billetera
 * ═══════════════════════════════════════════════════════════════
 *
 * Crea una billetera digital para un usuario. Si el usuario ya tiene
 * una billetera, retorna la existente (idempotente).
 *
 * Flujo:
 *   1. Buscar billetera existente por userId
 *   2. Si existe, retornarla
 *   3. Si no, crear nueva Wallet con Wallet.create()
 *   4. Persistir y retornar
 *
 * Capa: Aplicación (fin)
 *
 * @module CreateWalletUseCase
 */
import { WALLET_REPOSITORY_PORT } from '../../domain/interfaces/repositories/wallet.repository.port';
import type { WalletRepositoryPort } from '../../domain/interfaces/repositories/wallet.repository.port';
import { Wallet } from '../../domain/entities/wallet.entity';
import { Inject } from '@nestjs/common';

export class CreateWalletUseCase {
  constructor(
    @Inject(WALLET_REPOSITORY_PORT)
    private readonly walletRepo: WalletRepositoryPort,
  ) {}

  async execute(userId: string, currency: string = 'USD'): Promise<Wallet> {
    const existing = await this.walletRepo.findByUserId(userId);
    if (existing) {
      throw new Error('Wallet already exists for this user');
    }
    const wallet = Wallet.create(userId, currency);
    return this.walletRepo.save(wallet);
  }
}
