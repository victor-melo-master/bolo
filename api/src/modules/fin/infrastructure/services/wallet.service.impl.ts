// src/modules/fin/infrastructure/services/wallet.service.impl.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * WalletServiceImpl — Implementación del Puerto WalletServicePort
 * ═══════════════════════════════════════════════════════════════
 *
 * Implementa el contrato WalletServicePort delegando en los casos de
 * uso correspondientes. Actúa como fachada para que otros módulos
 * (ej: OpsModule) puedan operar sobre billeteras sin acoplarse a
 * los casos de uso directamente.
 *
 * Capa: Infraestructura (fin/services)
 *
 * @see WalletServicePort
 */

import { Injectable } from '@nestjs/common';
import { WalletServicePort } from '../../domain/interfaces/services/wallet.service.port';
import { CreateWalletUseCase } from '../../application/use-cases/create-wallet.use-case';

@Injectable()
export class WalletServiceImpl implements WalletServicePort {
  constructor(
    // Inyecta el caso de uso en lugar de acceder al repositorio directamente
    private readonly createWalletUseCase: CreateWalletUseCase,
  ) {}

  async createWallet(userId: string, currency?: string): Promise<void> {
    // Delega toda la lógica de negocio al caso de uso correspondiente
    await this.createWalletUseCase.execute(userId, currency);
  }
}
