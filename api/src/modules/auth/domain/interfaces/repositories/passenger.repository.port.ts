// auth/domain/interfaces/repositories/passenger.repository.port.ts

import { Passenger } from '../../entities';

export const PASSENGER_REPOSITORY_PORT = 'PASSENGER_REPOSITORY_PORT';

export interface PassengerRepositoryPort {
  findByPhone(phone: string): Promise<Passenger | null>;
  save(passenger: Passenger): Promise<Passenger>;
  updateJwtKey(passengerId: string, jwtKey: string): Promise<void>;
}
