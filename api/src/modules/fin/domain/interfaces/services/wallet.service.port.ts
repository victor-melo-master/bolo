// src/modules/fin/domain/interfaces/services/wallet.service.port.ts
export const WALLET_SERVICE_PORT = 'WALLET_SERVICE_PORT';

export interface WalletServicePort {
  createWallet(userId: string, currency?: string): Promise<void>;
}
