// src/modules/fin/domain/interfaces/repositories/transaction.repository.port.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * TransactionRepositoryPort — Puerto de Repositorio de Transacciones
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para la persistencia de transacciones financieras.
 *
 * Capa: Dominio (fin)
 *
 * @module TransactionRepositoryPort
 */

import { Transaction } from '../../entities/transaction.entity';

export const TRANSACTION_REPOSITORY_PORT = 'TransactionRepositoryPort';

export interface TransactionRepositoryPort {
  findById(id: string): Promise<Transaction | null>;
  findByWalletId(walletId: string): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<Transaction>;
  update(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
}
