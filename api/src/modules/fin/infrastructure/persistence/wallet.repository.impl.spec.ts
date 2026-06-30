// src/modules/fin/infrastructure/persistence/wallet.repository.impl.spec.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * WalletRepositoryImpl — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el repositorio de billeteras implemente
 * correctamente las operaciones de persistencia.
 *
 * @module test/wallet.repository.impl.spec
 */
import { WalletRepositoryImpl } from './wallet.repository.impl';
import { Wallet } from '../../domain/entities/wallet.entity';
import { WalletOrmEntity } from '../orm/wallet.orm-entity';
import { Repository } from 'typeorm';

describe('WalletRepositoryImpl', () => {
  let repo: WalletRepositoryImpl;
  let mockTypeOrmRepo: any;

  const mockOrmWallet: WalletOrmEntity = {
    id: 'wallet-id',
    userId: 'user-id',
    balance: 0,
    debtBalance: 0,
    creditUsed: false,
    currency: 'USD',
    lastTransactionAt: null,
    version: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  const mockDomainWallet = new Wallet(
    'wallet-id',
    'user-id',
    0,
    0,
    false,
    'USD',
    null,
    1,
    new Date('2026-01-01'),
    new Date('2026-01-01'),
  );

  beforeEach(() => {
    mockTypeOrmRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    repo = new WalletRepositoryImpl(
      mockTypeOrmRepo as Repository<WalletOrmEntity>,
    );
  });

  describe('save', () => {
    it('should convert domain to orm and save', async () => {
      mockTypeOrmRepo.save.mockResolvedValue(mockOrmWallet);

      const result = await repo.save(mockDomainWallet);

      expect(mockTypeOrmRepo.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Wallet);
      expect(result.id).toBe(mockOrmWallet.id);
      expect(result.userId).toBe(mockOrmWallet.userId);
    });
  });

  describe('findByUserId', () => {
    it('should return domain wallet when found', async () => {
      mockTypeOrmRepo.findOne.mockResolvedValue(mockOrmWallet);
      const result = await repo.findByUserId('user-id');
      expect(result).toBeInstanceOf(Wallet);
      expect(result?.userId).toBe('user-id');
      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
      });
    });

    it('should return null when not found', async () => {
      mockTypeOrmRepo.findOne.mockResolvedValue(null);
      const result = await repo.findByUserId('unknown');
      expect(result).toBeNull();
    });
  });
});
