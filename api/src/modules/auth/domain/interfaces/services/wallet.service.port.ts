export const WALLET_SERVICE_PORT = 'WALLET_SERVICE_PORT';

export interface WalletServicePort {
  createWallet(userId: string): Promise<void>;
}
