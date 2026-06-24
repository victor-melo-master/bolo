// src/shared/application/services/crypto.service.ts — Ruta relativa desde src/
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

// Importa la librería bcrypt para hashing seguro de contraseñas con sal
import * as bcrypt from 'bcrypt';

export class CryptoService {
  // Genera un hash bcrypt de la contraseña usando una sal aleatoria con costo 10
  async hash(password: string): Promise<string> {
    // Genera la sal con factor de costo 10 (balance entre seguridad y rendimiento)
    const salt = await bcrypt.genSalt(10);
    // Retorna el hash combinando la contraseña con la sal generada
    return bcrypt.hash(password, salt);
  }

  // Compara una contraseña en texto plano contra un hash almacenado previamente
  async compare(password: string, hash: string): Promise<boolean> {
    // bcrypt extrae la sal del hash y realiza la comparación de forma segura
    return bcrypt.compare(password, hash);
  }
}
