// src/modules/auth/domain/entities/driver-request.entity.ts
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

export type DriverRequestStatus = 'pending' | 'approved' | 'rejected';

export class DriverRequest {
  constructor(
    public readonly id: string,
    public readonly driverId: string,
    public readonly associationId: string,
    public readonly status: DriverRequestStatus,
    public readonly documentsUrls: Record<string, any> | null,
    public readonly rejectionReason: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(
    data: Omit<DriverRequest, 'id' | 'createdAt' | 'updatedAt'> & {
      id?: string;
    },
  ): DriverRequest {
    return new DriverRequest(
      data.id ?? crypto.randomUUID(),
      data.driverId,
      data.associationId,
      data.status ?? 'pending',
      data.documentsUrls ?? null,
      data.rejectionReason ?? null,
      new Date(),
      new Date(),
    );
  }
}
