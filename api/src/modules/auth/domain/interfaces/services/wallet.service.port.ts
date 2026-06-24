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

// Token de DI para identificar el servicio de billetera en el contenedor
export const WALLET_SERVICE_PORT = 'WALLET_SERVICE_PORT';

// Puerto para comunicación cross-module: auth necesita crear una billetera cuando un usuario se registra,
// pero la lógica de billeteras pertenece al módulo fin. Este puerto evita un acoplamiento directo.
// Definir el puerto aquí permite que el módulo auth declare la dependencia sin importar detalles de fin.
// La implementación real (WalletServiceImpl) está en el módulo fin y se inyecta via DI.
// Actualmente se usa un mock que no-op mientras el módulo fin no está completo.
export interface WalletServicePort {
  // Crea la billetera digital para un usuario tras su registro exitoso.
  createWallet(userId: string): Promise<void>;
}
