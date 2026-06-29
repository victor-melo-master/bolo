// auth/domain/interfaces/repositories/session.repository.port.ts

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
  findById(id: string): Promise<Session | null>; // ← añadir esta línea
}
