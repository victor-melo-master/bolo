// src/modules/fin/domain/entities/exchange-rate.entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * ExchangeRate — Entidad de Dominio de Tasa de Cambio
 * ═══════════════════════════════════════════════════════════════
 *
 * Representa una tasa de cambio para una moneda en una fecha determinada.
 * Ejemplo: 1 USD = 36.50 VES el 25/06/2026.
 *
 * La tabla fin.exchange_rates almacena un registro por día y moneda.
 * No maneja pares de monedas (from/to), sino la cantidad de moneda local
 * por 1 USD. Esto simplifica el modelo porque todas las tarifas se definen
 * en USD y luego se convierten a la moneda local al momento del cobro.
 *
 * Campos:
 *   - currency:       código ISO 4217 de la moneda local (ej: 'VES', 'COP')
 *   - rate:           valor de la tasa (ej: 36.50 significa 1 USD = 36.50 VES)
 *   - effective_date: fecha a partir de la cual rige la tasa
 *   - created_at, updated_at
 *
 * Capa: Dominio (fin)
 *
 * @module ExchangeRate
 */

export class ExchangeRate {
  constructor(
    // Identificador único UUID de la tasa de cambio
    public readonly id: string,
    // Código ISO 4217 de la moneda local (ej: 'VES', 'COP')
    // No se usa from/to porque todas las tasas son contra USD
    public readonly currency: string,
    // Valor de la tasa: cuántas unidades de currency equivalen a 1 USD
    // Ej: 36.50 = 1 USD → 36.50 VES
    public readonly rate: number,
    // Fecha a partir de la cual entra en vigencia esta tasa
    public readonly effectiveDate: Date,
    // Fecha de creación del registro en la base de datos
    public readonly createdAt: Date,
    // Fecha de última modificación del registro
    public readonly updatedAt: Date,
  ) {}
}
