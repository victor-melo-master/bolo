// src/modules/auth/domain/entities/driver-request.entity.ts — Ruta relativa desde src/
/**
 * ═══════════════════════════════════════════════════════════════
 * DriverRequest — Solicitud de Afiliación de Conductor
 * ═══════════════════════════════════════════════════════════════
 *
 * Representa la solicitud de un conductor para unirse a una
 * cooperativa. El flujo es:
 *   1. Conductor solicita afiliación (status: pending)
 *   2. Admin de la cooperativa revisa documentos
 *   3. Aprueba (status: approved) o rechaza (status: rejected)
 *      con una razón opcional.
 *
 * Los documentos se almacenan como URLs (fotos de cédula, licencia,
 * certificados médicos, etc.) en un objeto JSONB.
 *
 * Capa: Dominio (auth)
 * Método de fábrica:
 *   DriverRequest.create(data) — crea solicitud en estado 'pending'
 *
 * @module DriverRequest
 * @see DriverRequestStatus
 * @see Association
 */

// Tipo unión para los estados posibles del flujo de aprobación — cada transición tiene reglas de negocio
export type DriverRequestStatus = 'pending' | 'approved' | 'rejected';

export class DriverRequest {
  constructor(
    // readonly — garantiza que los campos no se modifiquen después de la creación (inmutabilidad)
    public readonly id: string, // Identificador único de la solicitud (UUID v4)
    public readonly driverId: string, // ID del conductor solicitante — FK a user.id
    public readonly associationId: string, // ID de la cooperativa destino — FK a association.id
    public readonly status: DriverRequestStatus, // Estado actual del flujo de aprobación
    public readonly documentsUrls: Record<string, any> | null, // Objeto JSONB con URLs de documentos probatorios
    public readonly rejectionReason: string | null, // Razón del rechazo — solo aplica si status === 'rejected'
    public readonly createdAt: Date, // Fecha de creación de la solicitud
    public readonly updatedAt: Date, // Fecha de última actualización (aprobación/rechazo)
  ) {}

  // Método de fábrica estático — centraliza la creación con defaults y oculta la complejidad del constructor
  static create(
    // Omit excluye campos auto-generados; id opcional permite rehidratación desde la BD
    data: Omit<DriverRequest, 'id' | 'createdAt' | 'updatedAt'> & {
      id?: string;
    },
  ): DriverRequest {
    return new DriverRequest(
      data.id ?? crypto.randomUUID(), // Genera UUID si no se proporciona
      data.driverId,
      data.associationId,
      data.status ?? 'pending', // Por defecto 'pending' — la solicitud comienza sin revisar
      data.documentsUrls ?? null,
      data.rejectionReason ?? null, // Inicialmente nulo — solo se llena si es rechazada
      new Date(), // createdAt — se fija al crear la solicitud
      new Date(), // updatedAt — inicialmente igual que createdAt
    );
  }
}
