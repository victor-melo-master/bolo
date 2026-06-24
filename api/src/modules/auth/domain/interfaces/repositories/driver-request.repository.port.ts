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

// Importa la entidad DriverRequest (solicitud de afiliación conductor-cooperativa)
import { DriverRequest } from '../../entities';

// Token de DI para distinguir este puerto en el contenedor
export const DRIVER_REQUEST_REPOSITORY_PORT = 'DRIVER_REQUEST_REPOSITORY_PORT';

// Puerto del repositorio de solicitudes de afiliación de conductores a cooperativas.
export interface DriverRequestRepositoryPort {
  // Busca una solicitud por su UUID.
  findById(id: string): Promise<DriverRequest | null>;
  // Busca una solicitud existente entre un conductor y una cooperativa específicos.
  // Útil para evitar solicitudes duplicadas o consultar el estado actual.
  findByDriverAndAssociation(
    driverId: string,
    associationId: string,
  ): Promise<DriverRequest | null>;
  // Persiste la solicitud (insert o update).
  save(request: DriverRequest): Promise<DriverRequest>;
}
