import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    service = new CryptoService();
  });

  describe('hash', () => {
    it('should return a bcrypt hash string', async () => {
      const password = 'Test1234';
      const hash = await service.hash(password);

      // Un hash bcrypt válido empieza con $2b$ o $2a$ y tiene cierta longitud
      expect(hash).toMatch(/^\$2[ab]\$\d{2}\$.+/);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should produce different hashes for the same password', async () => {
      const password = 'Test1234';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      // Los hashes deben ser diferentes porque usan salts distintos
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for correct password', async () => {
      const password = 'Test1234';
      const hash = await service.hash(password);
      const result = await service.compare(password, hash);
      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const hash = await service.hash('CorrectPass');
      const result = await service.compare('WrongPass', hash);
      expect(result).toBe(false);
    });

    it('should return false if hash is malformed', async () => {
      const result = await service.compare('any', 'not-a-valid-hash');
      expect(result).toBe(false);
    });
  });
});
