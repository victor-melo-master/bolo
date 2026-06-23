// src/modules/auth/domain/entities/association.entity.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * Association — Entidad de Dominio de Cooperativa/Asociación
 * ═══════════════════════════════════════════════════════════════
 *
 * Representa una cooperativa o asociación de transporte registrada
 * en el sistema. Cada asociación tiene un RIF (registro fiscal
 * venezolano), datos de contacto y un administrador designado.
 *
 * Las asociaciones agrupan conductores y definen tarifarios
 * (ver fin.coop_fares) y rutas (ver ops.routes).
 *
 * Capa: Dominio (auth)
 * Método de fábrica:
 *   Association.create(data) — construye una nueva asociación
 *
 * @module Association
 * @see DriverRequest
 */

export class Association {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly rif: string,
    public readonly address: string | null,
    public readonly phone: string | null,
    public readonly adminId: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    data: Omit<Association, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Association {
    return new Association(
      data.id ?? crypto.randomUUID(),
      data.name,
      data.rif,
      data.address ?? null,
      data.phone ?? null,
      data.adminId ?? null,
      data.isActive ?? true,
      new Date(),
      new Date(),
    );
  }
}
