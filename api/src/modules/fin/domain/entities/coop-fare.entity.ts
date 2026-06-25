// src/modules/fin/domain/entities/coop-fare.entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CoopFare — Entidad de Dominio de Tarifario de Cooperativa
 * ═══════════════════════════════════════════════════════════════
 *
 * Representa el tarifario (esquema de precios) de una cooperativa
 * de transporte. Cada cooperativa puede tener múltiples tarifarios
 * (por ejemplo, uno por año), pero solo uno activo a la vez.
 *
 * Campos:
 *   - id:                identificador único (UUID v7)
 *   - associationId:     cooperativa propietaria del tarifario
 *   - name:              nombre descriptivo (ej: "Tarifa estándar 2026")
 *   - baseAmountUsd:     precio base en centavos de dólar (BIGINT)
 *                        Todos los montos se almacenan en centavos para
 *                        evitar errores de redondeo con punto flotante.
 *   - exchangeRateId:    referencia a la tasa de cambio vigente
 *                        (fin.exchange_rates) usada para convertir
 *                        a moneda local en el momento del cobro.
 *   - surchargeNormal:   recargo/descuento para pasajeros normales
 *                        (centavos de moneda local). Puede ser negativo.
 *   - surchargeStudent:  recargo/descuento para estudiantes
 *   - surchargeElderly:  recargo/descuento para adultos mayores
 *   - isActive:          indica si el tarifario está activo (true)
 *                        o fue reemplazado por uno nuevo (false)
 *   - createdAt:         fecha de creación (inmutable)
 *   - updatedAt:         fecha de última modificación
 *
 * Reglas de negocio:
 *   - Los montos (baseAmountUsd, surcharges) están en centavos.
 *   - Los recargos/descuentos (surcharges) se aplican en moneda local.
 *   - Solo un tarifario por cooperativa puede estar activo a la vez.
 *   - Los tarifarios no se eliminan; se desactivan para mantener
 *     el historial de precios aplicados a viajes anteriores.
 *
 * Capa: Dominio (fin)
 * Método de fábrica:
 *   CoopFare.create({ associationId, name, baseAmountUsd, exchangeRateId, ... })
 *
 * @module CoopFare
 */

export class CoopFare {
  constructor(
    // Identificador único UUID del tarifario, generado en el dominio
    public readonly id: string,
    // ID de la cooperativa propietaria (FK a auth.associations)
    // No se usa "cooperativeId" porque la tabla SQL se llama association_id
    public readonly associationId: string,
    // Nombre descriptivo del tarifario (ej: "Tarifa estándar 2026")
    public readonly name: string,
    // Monto base del viaje en centavos de USD (BIGINT en BD)
    // Ejemplo: 150 = $1.50 USD. Toda conversión a decimal ocurre solo en presentación.
    public readonly baseAmountUsd: number,
    // ID de la tasa de cambio de referencia (FK a fin.exchange_rates)
    // Indica qué tasa se usará para convertir a moneda local al momento del cobro.
    public readonly exchangeRateId: string,
    // Recargo o descuento para pasajeros normales (centavos de moneda local)
    // Puede ser 0 (sin recargo), positivo (recargo) o negativo (descuento).
    public readonly surchargeNormal: number,
    // Recargo o descuento para estudiantes (centavos de moneda local)
    public readonly surchargeStudent: number,
    // Recargo o descuento para adultos mayores (centavos de moneda local)
    public readonly surchargeElderly: number,
    // Indica si el tarifario está activo. Solo uno por cooperativa debe estar true.
    // Cuando se crea uno nuevo, el anterior se desactiva (se pone en false).
    public readonly isActive: boolean,
    // Fecha de creación del registro (inmutable)
    public readonly createdAt: Date,
    // Fecha de última modificación del registro
    public readonly updatedAt: Date,
  ) {}

  /**
   * Método de fábrica estático.
   * Crea un nuevo tarifario activo con valores por defecto para los recargos.
   *
   * @param data - Objeto con los campos obligatorios y opcionales
   * @returns Nueva instancia de CoopFare lista para ser persistida
   */
  static create(data: {
    associationId: string;
    name: string;
    baseAmountUsd: number;
    exchangeRateId: string;
    surchargeNormal?: number;
    surchargeStudent?: number;
    surchargeElderly?: number;
  }): CoopFare {
    return new CoopFare(
      crypto.randomUUID(), // genera ID único
      data.associationId,
      data.name,
      data.baseAmountUsd,
      data.exchangeRateId,
      data.surchargeNormal ?? 0, // 0 si no se especifica
      data.surchargeStudent ?? 0,
      data.surchargeElderly ?? 0,
      true, // isActive: true por defecto
      new Date(), // createdAt: ahora
      new Date(), // updatedAt: ahora (mismo valor inicial)
    );
  }
}
