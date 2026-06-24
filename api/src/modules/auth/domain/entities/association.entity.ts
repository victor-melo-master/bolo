// src/modules/auth/domain/entities/association.entity.ts — Ruta relativa desde src/
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
    // readonly — inmutabilidad de la entidad; los campos no pueden reasignarse tras la construcción
    public readonly id: string,             // Identificador único (UUID v4) — clave primaria en la tabla
    public readonly name: string,           // Nombre legal de la cooperativa — único, se usa en facturación
    public readonly rif: string,            // Registro de Información Fiscal venezolano — obligatorio por ley
    public readonly address: string | null, // Dirección física — opcional, útil para sede fiscal
    public readonly phone: string | null,   // Teléfono de contacto — opcional, línea oficial de la cooperativa
    public readonly adminId: string | null, // ID del usuario administrador — nulo hasta que se designe uno
    public readonly isActive: boolean,      // Soft-delete — false si la cooperativa fue desactivada del sistema
    public readonly createdAt: Date,        // Fecha de registro — inmutable, se asigna al crear
    public readonly updatedAt: Date,        // Fecha de última modificación — se refresca en cada actualización
  ) {}

  // Método de fábrica estático — construye la entidad con valores predeterminados sensatos
  static create(
    // Omit elimina los campos auto-generados; id es opcional para soportar asignación externa (ej. desde la BD)
    data: Omit<Association, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Association {
    return new Association(
      data.id ?? crypto.randomUUID(), // Genera UUID si no se proporciona uno
      data.name,
      data.rif,
      data.address ?? null,           // Normaliza undefined a null para consistencia con la base de datos
      data.phone ?? null,
      data.adminId ?? null,
      data.isActive ?? true,          // Por defecto la asociación se crea activa — requiere desactivación explícita
      new Date(),                     // createdAt — momento exacto de la creación
      new Date(),                     // updatedAt — igual que createdAt inicialmente
    );
  }
}
