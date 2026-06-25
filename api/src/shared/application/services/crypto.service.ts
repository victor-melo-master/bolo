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

// ─── Importación de bcrypt para hashing seguro de contraseñas ───
// bcrypt es un algoritmo de hashing con sal incorporada que protege contra ataques
// de rainbow tables y fuerza bruta. El factor de costo (salt rounds) determina el
// tiempo de cómputo: a mayor costo, más seguro pero más lento.
import * as bcrypt from 'bcrypt';

// Servicio de aplicación que encapsula operaciones criptográficas compartidas
// entre múltiples módulos (Auth, Fin, etc.). Se inyecta en los casos de uso
// (CreateUserUseCase, LoginUseCase, etc.) para mantener la lógica de hashing
// centralizada y testeable.
export class CryptoService {
  // Genera un hash bcrypt seguro de una contraseña en texto plano.
  // El factor de costo 10 (2^10 iteraciones) ofrece un buen balance entre
  // seguridad y rendimiento para una API en producción.
  async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10); // Genera una sal criptográfica aleatoria con 10 rounds de costo
    return bcrypt.hash(password, salt); // Aplica el algoritmo bcrypt combinando contraseña + sal
  }

  // Compara una contraseña en texto plano contra un hash previamente almacenado.
  // bcrypt extrae automáticamente la sal del hash existente para realizar la comparación.
  // Retorna true si coinciden, false en caso contrario (seguro contra timing attacks).
  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
