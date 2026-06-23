// src/modules/fin/domain/entities/wallet.entity.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * Wallet — Entidad de Dominio de Billetera Digital
 * ═══════════════════════════════════════════════════════════════
 *
 * Representa la billetera digital de un usuario en el sistema BOLO.
 *
 * Características:
 *   - balance:      saldo disponible en centavos (BIGINT) — sin floats
 *   - debtBalance:  saldo de crédito de emergencia usado
 *   - creditUsed:   flag que indica si ya usó el crédito de emergencia
 *   - currency:     código ISO 4217 (USD, VED, etc.)
 *   - version:      control de concurrencia optimista (OCC) para evitar
 *                   condiciones de carrera en operaciones concurrentes
 *
 * Reglas de negocio:
 *   - Los montos siempre se almacenan en centavos (enteros) para
 *     evitar errores de redondeo por punto flotante
 *   - El crédito de emergencia es de uso único por usuario
 *   - Cada actualización incrementa version; si two escritores
 *     concurrentes detectan version distinta, uno debe reintentar
 *
 * Capa: Dominio (fin)
 * Método de fábrica:
 *   Wallet.create(userId, currency) — crea billetera con saldo 0
 *
 * @module Wallet
 */

export class Wallet {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly balance: number,
    public readonly debtBalance: number,
    public readonly creditUsed: boolean,
    public readonly currency: string,
    public readonly lastTransactionAt: Date | null,
    public readonly version: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(userId: string, currency: string = 'USD'): Wallet {
    return new Wallet(
      crypto.randomUUID(),
      userId,
      0,
      0,
      false,
      currency,
      null,
      1,
      new Date(),
      new Date(),
    );
  }
}
