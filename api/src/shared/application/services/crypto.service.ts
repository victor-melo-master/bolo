// src/shared/application/services/crypto.service.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * CryptoService — Servicio Compartido de Criptografía
 * ═══════════════════════════════════════════════════════════════
 *
 * Encapsula operaciones criptográficas usadas por múltiples módulos:
 *   - hash: genera hash bcrypt con sal (costo 10)
 *   - compare: verifica contraseña contra hash almacenado
 *
 * Se inyecta en los casos de uso (CreateUserUseCase, LoginUseCase).
 * Es un servicio de aplicación (no de infraestructura) porque la
 * lógica de hashing pertenece al dominio, no a un adaptador externo.
 *
 * Capa: Aplicación (shared) — Servicio
 *
 * @module CryptoService
 */

import * as bcrypt from 'bcrypt';

export class CryptoService {
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
