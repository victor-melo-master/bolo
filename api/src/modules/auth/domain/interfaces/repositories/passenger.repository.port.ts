// auth/domain/interfaces/repositories/passenger.repository.port.ts

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
}
