// auth/domain/interfaces/repositories/session.repository.port.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * SessionRepositoryPort — Puerto de Repositorio de Sesiones
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para operaciones de persistencia de la entidad
 * Session. Sigue el patrón Puerto-Adaptador (Hexagonal): el dominio
 * programa contra esta abstracción, la infraestructura provee la
 * implementación concreta.
 *
 * Capa: Dominio (auth) — Puerto de salida
 *
 * @module SessionRepositoryPort
 */

import { Session } from '../../entities';

export const SESSION_REPOSITORY_PORT = 'SESSION_REPOSITORY_PORT';

export interface SessionRepositoryPort {
  save(session: Session): Promise<Session>;
  findActiveByUserAndClient(
    userId: string,
    userType: string,
    clientType: string,
  ): Promise<Session | null>;
  deactivateAllForUser(userId: string, userType: string): Promise<void>;
  save(session: Session): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  deactivateExpired(): Promise<void>;
}
