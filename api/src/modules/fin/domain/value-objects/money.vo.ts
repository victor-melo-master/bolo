// src/modules/fin/domain/value-objects/money.vo.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Money — Value Object Inmutable para Manejo de Montos
 * ═══════════════════════════════════════════════════════════════
 *
 * Value Object que encapsula un monto financiero con su moneda.
 * Todos los montos se almacenan en centavos (enteros) para evitar
 * errores de redondeo por punto flotante (IEEE 754).
 *
 * Reglas de negocio:
 *   - El monto siempre es un entero (centavos). Se rechazan decimales en el constructor.
 *   - La moneda debe ser un código ISO 4217 de 3 letras.
 *   - Operaciones aritméticas (add, subtract) validan que ambas monedas coincidan.
 *   - fromDecimal() convierte desde decimal (ej: 10.50 USD → 1050 centavos).
 *   - fromCents() recibe directamente centavos.
 *   - toDecimal() expresa en unidad monetaria (ej: 1050 → 10.50).
 *
 * Capa: Dominio (fin)
 *
 * @module Money
 */

export class Money {
  private constructor(
    public readonly amount: number,    // Monto en centavos (entero)
    public readonly currency: string,  // Código ISO 4217 (3 letras, mayúsculas)
  ) {
    if (!Number.isInteger(amount)) {
      throw new Error('Money amount must be in cents (integer)');
    }
    if (currency.length !== 3) {
      throw new Error('Currency must be a 3-letter ISO 4217 code');
    }
  }

  // Fábrica desde centavos (entero). Ej: Money.fromCents(1050, 'USD')
  static fromCents(amount: number, currency: string): Money {
    return new Money(amount, currency.toUpperCase());
  }

  // Fábrica desde decimal (float). Convierte a centavos automáticamente.
  // Ej: Money.fromDecimal(10.50, 'USD') → 1050 centavos
  static fromDecimal(amount: number, currency: string): Money {
    return new Money(Math.round(amount * 100), currency.toUpperCase());
  }

  // Suma dos montos de la misma moneda. Lanza error si las monedas difieren.
  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  // Resta dos montos de la misma moneda.
  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  // Multiplica el monto por un factor (ej: para impuestos, propinas).
  // Redondea el resultado al entero más cercano.
  multiply(factor: number): Money {
    return new Money(Math.round(this.amount * factor), this.currency);
  }

  // Convierte a decimal (unidad monetaria). Ej: 1050 → 10.50
  toDecimal(): number {
    return this.amount / 100;
  }

  // Retorna true si el monto es cero.
  isZero(): boolean {
    return this.amount === 0;
  }

  // Retorna true si el monto es negativo.
  isNegative(): boolean {
    return this.amount < 0;
  }

  // Retorna true si este monto es >= otro (misma moneda).
  isGreaterThanOrEqual(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount >= other.amount;
  }

  // Valida que ambas monedas coincidan. Lanza error si no.
  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: ${this.currency} vs ${other.currency}`,
      );
    }
  }
}
