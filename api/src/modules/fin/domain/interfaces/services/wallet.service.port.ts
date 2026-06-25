// src/modules/fin/domain/interfaces/services/wallet.service.port.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * WalletServicePort — Puerto de Servicio de Billetera
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para el servicio de billetera expuesto a otros
 * módulos (ej: OpsModule). Actúa como fachada hacia los casos de uso.
 *
 * Capa: Dominio (fin)
 *
 * @module WalletServicePort
 */

// Token de inyección de dependencias para identificar este puerto en el contenedor DI de NestJS
export const WALLET_SERVICE_PORT = 'WALLET_SERVICE_PORT';

export interface WalletServicePort {
  // Crea una billetera para el usuario dado; si ya existe, puede lanzar error o retornar la existente
  createWallet(userId: string, currency?: string): Promise<void>;
}
