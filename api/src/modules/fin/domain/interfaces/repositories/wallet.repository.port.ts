// src/modules/fin/domain/interfaces/repositories/wallet.repository.port.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * WalletRepositoryPort — Puerto de Repositorio de Billeteras
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para la persistencia de la entidad Wallet.
 * Las implementaciones concretas (TypeORM, mock, etc.) deben
 * cumplir con esta interfaz.
 *
 * Capa: Dominio (fin)
 *
 * @module WalletRepositoryPort
 */

import { Wallet } from '../../entities/wallet.entity';

export const WALLET_REPOSITORY_PORT = 'WalletRepositoryPort';

export interface WalletRepositoryPort {
  findById(id: string): Promise<Wallet | null>;
  findByUserId(userId: string): Promise<Wallet | null>;
  save(wallet: Wallet): Promise<Wallet>;
  update(id: string, wallet: Partial<Wallet>): Promise<Wallet>;
  delete(id: string): Promise<void>;
}
