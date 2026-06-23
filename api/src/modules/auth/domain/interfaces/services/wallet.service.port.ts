// src/modules/auth/domain/interfaces/services/wallet.service.port.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * WalletServicePort — Puerto de Servicio de Billetera
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para crear la billetera digital de un usuario
 * al momento del registro. La implementación real reside en el
 * módulo fin (WalletServiceImpl). Actualmente el módulo auth usa
 * un mock que no-op.
 *
 * Capa: Dominio (auth) — Puerto de salida
 *
 * @module WalletServicePort
 * @see WALLET_SERVICE_PORT
 */

export const WALLET_SERVICE_PORT = 'WALLET_SERVICE_PORT';

export interface WalletServicePort {
  createWallet(userId: string): Promise<void>;
}
