// src/modules/auth/domain/interfaces/repositories/driver-request.repository.port.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * DriverRequestRepositoryPort — Puerto de Repositorio de Solicitudes
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para el repositorio de solicitudes de afiliación
 * de conductores a cooperativas.
 *
 * Métodos:
 *   - findById(id):                    busca por UUID
 *   - findByDriverAndAssociation(id):  busca solicitud existente entre
 *                                      un conductor y una cooperativa
 *   - save(request):                   persiste la solicitud
 *
 * TODO: Agregar métodos para filtrar por estado (pending/approved/rejected).
 *
 * Capa: Dominio (auth) — Puerto de salida
 *
 * @module DriverRequestRepositoryPort
 * @see DRIVER_REQUEST_REPOSITORY_PORT
 */

import { DriverRequest } from '../../entities';

export const DRIVER_REQUEST_REPOSITORY_PORT = 'DRIVER_REQUEST_REPOSITORY_PORT';

export interface DriverRequestRepositoryPort {
  findById(id: string): Promise<DriverRequest | null>;
  findByDriverAndAssociation(
    driverId: string,
    associationId: string,
  ): Promise<DriverRequest | null>;
  save(request: DriverRequest): Promise<DriverRequest>;
}
