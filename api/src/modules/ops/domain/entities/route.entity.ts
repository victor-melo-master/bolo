// src/modules/ops/domain/entities/route.entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * Route — Entidad de dominio para rutas de transporte
 * ═══════════════════════════════════════════════════════════════
 *
 * Representa una ruta operativa dentro de una asociación de transporte.
 * Cada ruta pertenece a una asociación (associationId), tiene un nombre
 * descriptivo, y está vinculada a un tarifario (coopFareId) para calcular
 * el costo del viaje.
 *
 * La entidad es inmutable: todos los campos son readonly. Los cambios
 * de estado se modelan creando nuevas instancias o mediante métodos
 * de dominio (a futuro).
 *
 * Capa: Dominio (ops)
 *
 * @module Route
 */
export class Route {
  constructor(
    public readonly id: string, // UUID único generado por el dominio
    public readonly associationId: string, // FK hacia la asociación propietaria
    public readonly name: string, // Nombre legible de la ruta (ej. "Ruta Centro-Norte")
    public readonly description: string | null, // Descripción opcional (ej. puntos de interés, horarios)
    public readonly coopFareId: string, // FK hacia el tarifario (fin.coop_fares) para cálculo de tarifa
    public readonly isActive: boolean, // Indica si la ruta está operativa (true) o desactivada
    public readonly createdAt: Date, // Timestamp de creación
    public readonly updatedAt: Date, // Timestamp de última actualización
  ) {}

  /**
   * Crea una nueva ruta con valores por defecto.
   * - Genera un UUID v4 automáticamente.
   * - isActive se inicializa como true (activa).
   * - createdAt y updatedAt se fijan al momento actual.
   *
   * @param data — Datos mínimos requeridos para crear una ruta
   * @returns Route — Nueva instancia de ruta
   */
  static create(data: {
    associationId: string; // Asociación a la que pertenece la ruta
    name: string; // Nombre de la ruta
    description?: string; // Descripción opcional
    coopFareId: string; // Tarifario asociado para cálculos de precio
  }): Route {
    return new Route(
      crypto.randomUUID(), // Genera identificador único universal
      data.associationId,
      data.name,
      data.description ?? null, // Si no hay descripción, se almacena null explícitamente
      data.coopFareId,
      true, // isActive: true por defecto — la ruta se crea activa
      new Date(),
      new Date(),
    );
  }
}
