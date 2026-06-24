// src/modules/fin/domain/entities/exchange-rate.entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * ExchangeRate — Entidad de Dominio de Tipo de Cambio
 * ═══════════════════════════════════════════════════════════════
 *
 * Representa una tasa de conversión entre dos monedas ISO 4217
 * vigente en un período de tiempo (validFrom — validUntil).
 *
 * Se usa para convertir montos entre la moneda funcional (USD)
 * y monedas locales (VED, COP, etc.) al procesar pagos.
 *
 * Reglas de negocio:
 *   - Un tipo de cambio tiene vigencia temporal (validFrom/validUntil)
 *   - Si validUntil es null, el tipo de cambio está vigente indefinidamente
 *   - La conversión se hace multiplicando: amount * rate
 *   - El resultado se redondea a entero (centavos)
 *
 * Capa: Dominio (fin)
 * Método de fábrica:
 *   ExchangeRate.create(from, to, rate, validFrom, validUntil?)
 *
 * @module ExchangeRate
 */

export class ExchangeRate {
  constructor(
    // Identificador único UUID
    public readonly id: string,
    // Moneda origen (código ISO 4217, ej: "USD")
    public readonly fromCurrency: string,
    // Moneda destino (código ISO 4217, ej: "VED")
    public readonly toCurrency: string,
    // Tasa de conversión: 1 fromCurrency = rate toCurrency
    public readonly rate: number,
    // Inicio de vigencia de la tasa
    public readonly validFrom: Date,
    // Fin de vigencia de la tasa. null = vigente indefinidamente
    public readonly validUntil: Date | null,
    // Control de concurrencia optimista
    public readonly version: number,
    // Fecha de creación del registro
    public readonly createdAt: Date,
    // Fecha de última modificación
    public readonly updatedAt: Date,
  ) {}

  // Método de fábrica: crea un nuevo tipo de cambio con versión 1.
  static create(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    validFrom: Date,
    validUntil?: Date,
  ): ExchangeRate {
    return new ExchangeRate(
      crypto.randomUUID(),
      fromCurrency,
      toCurrency,
      rate,
      validFrom,
      validUntil ?? null,
      1,
      new Date(),
      new Date(),
    );
  }

  // Verifica si el tipo de cambio está vigente en una fecha dada.
  // Si validUntil es null, se considera vigente desde validFrom en adelante.
  isEffective(at: Date = new Date()): boolean {
    return at >= this.validFrom && (this.validUntil === null || at <= this.validUntil);
  }

  // Convierte un monto usando la tasa de cambio. Retorna entero redondeado (centavos).
  convert(amount: number): number {
    return Math.round(amount * this.rate);
  }
}
