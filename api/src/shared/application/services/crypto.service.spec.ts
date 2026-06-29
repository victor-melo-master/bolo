// src/shared/application/services/crypto.service.spec.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CryptoService — Test Unitario
 * ═══════════════════════════════════════════════════════════════
 *
 * Verifica que el servicio criptográfico implemente
 * correctamente las operaciones de hash y comparación.
 *
 * @module test/crypto.service.spec
 */
// Importa el servicio a testear para verificar su comportamiento criptográfico
import { CryptoService } from './crypto.service';

// Describe el conjunto de pruebas del servicio criptográfico
describe('CryptoService', () => {
  // Instancia del servicio que se reasigna antes de cada test
  let service: CryptoService;

  // Se ejecuta antes de cada test para tener una instancia fresca y aislada
  beforeEach(() => {
    service = new CryptoService();
  });

  // Grupo de pruebas para el método hash
  describe('hash', () => {
    // Verifica que el hash generado tenga el formato bcrypt válido ($2b$ o $2a$)
    it('should return a bcrypt hash string', async () => {
      const password = 'Test1234';
      const hash = await service.hash(password);

      // Un hash bcrypt válido empieza con $2b$ o $2a$ y tiene cierta longitud
      expect(hash).toMatch(/^\$2[ab]\$\d{2}\$.+/);
      expect(hash.length).toBeGreaterThan(20);
    });

    // Verifica que la misma contraseña produzca hashes diferentes (por la sal aleatoria)
    it('should produce different hashes for the same password', async () => {
      const password = 'Test1234';
      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      // Los hashes deben ser diferentes porque usan salts distintos
      expect(hash1).not.toBe(hash2);
    });
  });

  // Grupo de pruebas para el método compare
  describe('compare', () => {
    // Verifica que la contraseña correcta coincida con su hash
    it('should return true for correct password', async () => {
      const password = 'Test1234';
      const hash = await service.hash(password);
      const result = await service.compare(password, hash);
      expect(result).toBe(true);
    });

    // Verifica que una contraseña incorrecta no coincida con el hash
    it('should return false for incorrect password', async () => {
      const hash = await service.hash('CorrectPass');
      const result = await service.compare('WrongPass', hash);
      expect(result).toBe(false);
    });

    // Verifica que un hash malformado no cause errores y retorne false
    it('should return false if hash is malformed', async () => {
      const result = await service.compare('any', 'not-a-valid-hash');
      expect(result).toBe(false);
    });
  });
});
