// src/modules/fin/domain/entities/coop-fare.entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * CoopFare — Entidad de Dominio de Tarifa por Cooperativa
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el tarifario de una cooperativa (asociación de conductores).
 * Cada cooperativa tiene una tarifa base más un costo por kilómetro
 * que se usa para calcular el precio de un viaje.
 *
 * Reglas de negocio:
 *   - baseFare: monto fijo por viaje (en centavos)
 *   - perKmRate: costo por kilómetro recorrido (en centavos)
 *   - cost = baseFare + (perKmRate * distanceKm)
 *   - Una cooperativa solo tiene UNA tarifa activa a la vez
 *   - Las tarifas se desactivan (no se eliminan) para mantener historial
 *
 * Capa: Dominio (fin)
 * Método de fábrica:
 *   CoopFare.create(cooperativeId, name, baseFare, perKmRate, currency)
 *
 * @module CoopFare
 */

export class CoopFare {
  constructor(
    // Identificador único UUID de la tarifa
    public readonly id: string,
    // ID de la cooperativa asociada (referencia a auth.associations)
    public readonly cooperativeId: string,
    // Nombre descriptivo de la tarifa (ej: "Tarifa estándar", "Tarifa nocturna")
    public readonly name: string,
    // Tarifa base por viaje en centavos (BIGINT). Monto fijo que se cobra siempre.
    public readonly baseFare: number,
    // Tarifa por kilómetro en centavos (BIGINT). Se multiplica por la distancia del viaje.
    public readonly perKmRate: number,
    // Moneda ISO 4217 en que se expresa la tarifa
    public readonly currency: string,
    // Indica si la tarifa está activa (true) o desactivada (false). Solo una activa por cooperativa.
    public readonly active: boolean,
    // Control de concurrencia optimista
    public readonly version: number,
    // Fecha de creación
    public readonly createdAt: Date,
    // Fecha de última modificación
    public readonly updatedAt: Date,
  ) {}

  // Método de fábrica: crea una tarifa activa con versión 1.
  static create(
    cooperativeId: string,
    name: string,
    baseFare: number,
    perKmRate: number,
    currency: string = 'USD',
  ): CoopFare {
    return new CoopFare(
      crypto.randomUUID(),
      cooperativeId,
      name,
      baseFare,
      perKmRate,
      currency,
      true,      // active: true — la tarifa se crea activa por defecto
      1,         // version: 1
      new Date(),
      new Date(),
    );
  }

  // Calcula el costo total de un viaje según distancia: baseFare + (perKmRate * distanceKm).
  // distanceKm se expresa en kilómetros (punto flotante, se redondea a entero el resultado).
  calculateTripCost(distanceKm: number): number {
    return this.baseFare + Math.round(this.perKmRate * distanceKm);
  }

  // Desactiva la tarifa. Retorna nueva instancia con active=false y version+1.
  // No se elimina para mantener el historial de tarifas aplicadas.
  deactivate(): CoopFare {
    return new CoopFare(
      this.id,
      this.cooperativeId,
      this.name,
      this.baseFare,
      this.perKmRate,
      this.currency,
      false,                      // active: false
      this.version + 1,
      this.createdAt,
      new Date(),
    );
  }
}
