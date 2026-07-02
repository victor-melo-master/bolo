// auth/domain/interfaces/repositories/passenger.repository.port.ts
/**
 * ═══════════════════════════════════════════════════════════════
 * PassengerRepositoryPort — Puerto de Repositorio de Pasajeros
 * ═══════════════════════════════════════════════════════════════
 *
 * Define el contrato para operaciones de persistencia de la entidad
 * Passenger. Sigue el patrón Puerto-Adaptador (Hexagonal): el dominio
 * programa contra esta abstracción, la infraestructura provee la
 * implementación concreta.
 *
 * Capa: Dominio (auth) — Puerto de salida
 *
 * @module PassengerRepositoryPort
 */

import { Passenger } from '../../entities';

export const PASSENGER_REPOSITORY_PORT = 'PASSENGER_REPOSITORY_PORT';

// En PassengerRepositoryPort:
export interface PassengerRepositoryPort {
  findByPhone(phone: string): Promise<Passenger | null>;
  findById(id: string): Promise<Passenger | null>; // ← añadir
  save(passenger: Passenger): Promise<Passenger>;
  updateJwtKey(passengerId: string, jwtKey: string): Promise<void>;
  softDelete(passengerId: string): Promise<void>;
  findByEmail(email: string): Promise<Passenger | null>;
  findByCedula(cedula: string): Promise<Passenger | null>;
  updateLastLogin(userId: string): Promise<void>;
  findByPhoneIncludeDeleted(phone: string): Promise<Passenger | null>;
  findByEmailIncludeDeleted(email: string): Promise<Passenger | null>;
  findByRecoveryCode(code: string): Promise<Passenger | null>;
  updateRecoveryCode(
    passengerId: string,
    code: string,
    expiresAt: Date,
  ): Promise<void>;
  reactivate(passengerId: string): Promise<void>;
}
