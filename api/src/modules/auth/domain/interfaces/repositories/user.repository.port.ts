// projectBolo/api/src/modules/auth/domain/interfaces/repositories/user.repository.port.ts
import { User } from '../../entities';

// Token único para inyección (no se debe repetir en otra parte)
export const USER_REPOSITORY_PORT = 'USER_REPOSITORY_PORT';

export interface UserRepositoryPort {
  findById(id: string): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  save(user: User): Promise<User>;
  // ... otros métodos que necesites
}
