// src/modules/fin/interfaces/rest/wallet.controller.spec.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * WalletController — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el controlador de billeteras maneje
 * correctamente las rutas HTTP y delegue en los casos de uso.
 *
 * @module test/wallet.controller.spec
 */
import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WALLET_SERVICE_PORT } from '../../domain/interfaces/services/wallet.service.port';
import { CreateWalletDto } from '../../application/dto/create-wallet.dto';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: any;

  beforeEach(async () => {
    walletService = {
      createWallet: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [{ provide: WALLET_SERVICE_PORT, useValue: walletService }],
    }).compile();

    controller = module.get<WalletController>(WalletController);
  });

  describe('POST /fin/wallets', () => {
    const dto: CreateWalletDto = {
      userId: 'user-123',
      currency: 'USD',
    };

    it('should create wallet and return success message', async () => {
      walletService.createWallet.mockResolvedValue(undefined); // no retorna nada

      const result = await controller.createWallet(dto);

      expect(walletService.createWallet).toHaveBeenCalledWith(
        dto.userId,
        dto.currency,
      );
      expect(result).toEqual({ message: 'Wallet created successfully' });
    });

    it('should throw error if service fails', async () => {
      walletService.createWallet.mockRejectedValue(
        new Error('Wallet already exists'),
      );

      await expect(controller.createWallet(dto)).rejects.toThrow(
        'Wallet already exists',
      );
    });
  });
});
