// src/modules/fin/domain/exceptions/insufficient-balance.exception.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * InsufficientBalanceException — Saldo Insuficiente
 * ═══════════════════════════════════════════════════════════════
 *
 * Se lanza cuando una operación (retiro, pago) requiere más fondos
 * de los disponibles en la billetera, incluyendo el crédito de emergencia.
 *
 * Incluye el saldo actual y el monto requerido para facilitar el
 * debugging y la respuesta al cliente.
 *
 * Capa: Dominio (fin)
 *
 * @module InsufficientBalanceException
 */

export class InsufficientBalanceException extends Error {
  public readonly walletId: string;
  public readonly currentBalance: number;
  public readonly requiredAmount: number;

  constructor(walletId: string, currentBalance: number, requiredAmount: number) {
    super(
      `Insufficient balance in wallet ${walletId}: ` +
      `current=${currentBalance}, required=${requiredAmount}`,
    );
    this.name = 'InsufficientBalanceException';
    this.walletId = walletId;
    this.currentBalance = currentBalance;
    this.requiredAmount = requiredAmount;
  }
}
